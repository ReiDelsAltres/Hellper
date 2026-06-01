import { Fetcher, Observable, Page, RePage, Router, TemplateHolder } from "@Purper";
import { Semestr, Subject, ExamFile, ExamQuestion } from "../frac/Testing.js";
import { KatexUtils } from "../KatexUtils.js";
import PresetStore, { TestPreset } from "../lib/PresetStore.js";
import QuestionLibrary, { QuestionHeader } from "../lib/QuestionLibrary.js";
import QuestionComponent, { QuestionModel } from "../components/QuestionComponent.html.js";
import ReInput from "../components/ReInput.html.js";
import ReButtonGroup from "../components/ReButtonGroup.html.js";
import ReButton from "../components/ReButton.html.js";
import ReCheckbox from "../components/ReCheckbox.html.js";
import ReRangeSlider from "../components/ReRangeSlider.html.js";

/** A subject the user can browse in the library. */
interface SubjectOption {
    value: string;   // subject.file — unique key
    label: string;   // displayed in the subject dropdown
    semester: string;
    subject: Subject;
}

/** A question picked into one of the drop zones — plain text only (no KaTeX) for safe chip display. */
interface PickedItem {
    id: string;
    title: string;
}

/** View model for the saved-presets list. */
interface PresetView {
    id: string;
    name: string;
    subjectName: string;
    countLabel: string;
    requiredLabel: string;
    excludedLabel: string;
}

const LIBRARY_CAP = 60;
const DEFAULT_PRESETS_URL = './resources/presets/';

@RePage({
    markupURL: "./src/pages/GeneratorsPage.hmle",
    cssURL: "./src/pages/GeneratorsPage.html.css",
}, "/generators")
export default class GeneratorsPage extends Page {
    // ── Source data ──
    private subjectOptions: SubjectOption[] = [];
    private librarySemesters: string[] = [];
    private selectedSubject: SubjectOption | null = null;
    /** All questions of the selected subject, mapped for QuestionComponent (KaTeX-rendered). */
    private subjectModels: QuestionModel[] = [];
    /** Plain-text lookup (id → {id, title}) for drop-zone chips. */
    private plainById: Map<string, PickedItem> = new Map();

    // ── Editor selections ──
    private requiredIds: Set<string> = new Set();
    private excludedIds: Set<string> = new Set();
    private editingPresetId: string | null = null;

    // ── Reactive view state ──
    private libraryModels: Observable<QuestionModel[]> = new Observable<QuestionModel[]>([]);
    private requiredItems: Observable<PickedItem[]> = new Observable<PickedItem[]>([]);
    private excludedItems: Observable<PickedItem[]> = new Observable<PickedItem[]>([]);
    private presetList: Observable<PresetView[]> = new Observable<PresetView[]>([]);

    private editorTitle: Observable<string> = new Observable<string>("Новый пресет");
    private statusText: Observable<string> = new Observable<string>("");
    private presetCountText: Observable<string> = new Observable<string>("0");
    private requiredCountText: Observable<string> = new Observable<string>("0");
    private excludedCountText: Observable<string> = new Observable<string>("0");
    private libraryCountText: Observable<string> = new Observable<string>("—");

    private hasPresets: Observable<boolean> = new Observable<boolean>(false);
    private noPresets: Observable<boolean> = new Observable<boolean>(true);
    private hasSubject: Observable<boolean> = new Observable<boolean>(false);
    private noSubject: Observable<boolean> = new Observable<boolean>(true);
    private favoritesView: Observable<QuestionModel[]> = new Observable<QuestionModel[]>([]);
    private favoritesCountText: Observable<string> = new Observable<string>("0");
    private hasFavorites: Observable<boolean> = new Observable<boolean>(false);
    private noFavorites: Observable<boolean> = new Observable<boolean>(true);

    private defaultPresets: Observable<PresetView[]> = new Observable<PresetView[]>([]);
    private hasDefaultPresets: Observable<boolean> = new Observable<boolean>(false);
    /** Map preset ID → filename for loading. */
    private defaultPresetFilenames: Map<string, string> = new Map();

    // ── Refs (resolved during template processing) ──
    private nameInput?: ReInput;
    private testTypeGroup?: ReButtonGroup;
    private noShuffleCheckbox?: ReCheckbox;
    private countInput?: ReInput;
    private rangeSlider?: ReRangeSlider;
    private searchInput?: ReInput;
    private librarySemesterSelect?: HTMLSelectElement;
    private librarySubjectSelect?: HTMLSelectElement;
    private libraryContainer?: HTMLElement;
    private favoritesContainer?: HTMLElement;
    private requiredZone?: HTMLElement;
    private excludedZone?: HTMLElement;
    private importFileInput?: HTMLInputElement;

    protected async preInit(): Promise<void> {
        const semesters = await Fetcher.fetchJSON('./resources/data/testing.json') as Semestr[];
        const semSet = new Set<string>();
        for (const sem of semesters) {
            semSet.add(sem.number);
            for (const sub of sem.subjects) {
                this.subjectOptions.push({
                    value: sub.file,
                    label: sub.translatedName || sub.name,
                    semester: sem.number,
                    subject: sub,
                });
            }
        }
        this.librarySemesters = [...semSet];

        // Prime the question library (semester map + one-time legacy favourites import).
        await QuestionLibrary.ensureCatalog();

        // Load default presets
        await this.loadDefaultPresets();
    }

    protected async postLoad(holder: TemplateHolder): Promise<void> {
        // Test-mode button-group visual sync.
        this.testTypeGroup?.addEventListener('selection-change', (e) => this.syncTestTypeVisual((e as CustomEvent).detail.buttons));
        if (this.testTypeGroup?.buttonMap) this.syncTestTypeVisual(this.testTypeGroup.buttonMap);

        // Keep the count within the selected range span.
        this.rangeSlider?.addEventListener('change', () => this.clampCountToRange());
        this.countInput?.Value.subscribe(() => this.syncRangeValueMarker());

        // Drop-zone wiring.
        this.wireDropZone(this.requiredZone, (id) => this.addRequired(id));
        this.wireDropZone(this.excludedZone, (id) => this.addExcluded(id));

        // Populate library filters.
        this.populateSemesterSelect();
        this.populateSubjectSelect('');


        this.refreshPresetList();
        void this.refreshFavorites();
        this.syncRangeDefaults();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Library filters (semester / subject)
    // ──────────────────────────────────────────────────────────────────────────

    private populateSemesterSelect(): void {
        const sel = this.librarySemesterSelect;
        if (!sel) return;
        sel.innerHTML = '<option value="">Все семестры</option>';
        for (const sem of this.librarySemesters) {
            const opt = document.createElement('option');
            opt.value = sem;
            opt.textContent = `Семестр ${sem}`;
            sel.appendChild(opt);
        }
    }

    private populateSubjectSelect(semester: string): void {
        const sel = this.librarySubjectSelect;
        if (!sel) return;
        const currentVal = sel.value;
        sel.innerHTML = '<option value="">— выберите предмет —</option>';
        const visible = this.subjectOptions.filter(o => !semester || o.semester === semester);
        for (const o of visible) {
            const opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.label;
            sel.appendChild(opt);
        }
        if (visible.some(o => o.value === currentVal)) {
            sel.value = currentVal;
        }
    }

    public onLibrarySemesterChange(): void {
        const sem = this.librarySemesterSelect?.value ?? '';
        this.populateSubjectSelect(sem);
        void this.onLibrarySubjectChange();
    }

    public onLibrarySubjectChange(): void {
        const file = this.librarySubjectSelect?.value || '';
        if (!file) {
            this.selectedSubject = null;
            this.subjectModels = [];
            this.plainById.clear();
            this.hasSubject.setObject(false);
            this.noSubject.setObject(true);
            this.libraryCountText.setObject('—');
            this.refreshZones();
            return;
        }
        const option = this.subjectOptions.find(o => o.value === file) || null;
        void this.loadSubject(option, true);
    }

    /** Fetch a subject's questions and (re)build the library. `reset` clears current picks. */
    private async loadSubject(option: SubjectOption | null, reset: boolean): Promise<void> {
        this.selectedSubject = option;
        if (reset) {
            this.requiredIds.clear();
            this.excludedIds.clear();
        }

        if (!option) {
            this.subjectModels = [];
            this.plainById.clear();
            this.hasSubject.setObject(false);
            this.noSubject.setObject(true);
            this.refreshZones();
            return;
        }

        try {
            const data = await Fetcher.fetchJSON('./resources/data/' + option.subject.file) as ExamFile;
            this.subjectModels = [];
            this.plainById.clear();
            for (const q of data.Questions) {
                this.subjectModels.push(this.toModel(q));
                const id = String(q.Id);
                this.plainById.set(id, { id, title: this.truncate(q.Title, 90) });
            }
        } catch (e) {
            console.warn('[Generators] Failed to load subject', option.subject.file, e);
            this.subjectModels = [];
            this.plainById.clear();
        }

        this.hasSubject.setObject(true);
        this.noSubject.setObject(false);

        // Range slider spans the whole subject; default count = full set.
        const total = this.subjectModels.length;
        if (this.rangeSlider) {
            this.rangeSlider.Min.setObject(1);
            this.rangeSlider.Max.setObject(Math.max(1, total));
            this.rangeSlider.Lower.setObject(1);
            this.rangeSlider.Upper.setObject(Math.max(1, total));
        }
        if (this.countInput) {
            this.countInput.Max.setObject(Math.max(1, total));
            if (reset) this.countInput.Value.setObject(String(Math.min(total, 25) || total));
        }

        this.renderLibrary();
        this.refreshZones();
    }

    /** Build the (filtered + capped) library and feed each QuestionComponent its data. */
    private renderLibrary(): void {
        const search = (this.searchInput?.Value?.value ?? '').toLowerCase().trim();
        const picked = new Set([...this.requiredIds, ...this.excludedIds]);
        const matched = this.subjectModels.filter(m => {
            if (picked.has(String(m.id))) return false;
            if (!search) return true;
            const hay = (m.title + ' ' + m.answers.map(a => a.text).join(' ')).toLowerCase();
            return hay.includes(search);
        });
        const shown = matched.slice(0, LIBRARY_CAP);

        this.libraryModels.setObject(shown);
        this.bindLibrary(shown);

        this.libraryCountText.setObject(
            matched.length > shown.length
                ? `${shown.length} из ${matched.length}`
                : `${matched.length}`
        );
    }

    /** After the <for> re-renders, push the data into each <question-component> positionally. */
    private bindLibrary(models: QuestionModel[]): void {
        const container = this.libraryContainer;
        if (!container) return;
        const comps = Array.from(container.querySelectorAll('question-component')) as QuestionComponent[];
        const subjectFile = this.selectedSubject?.subject.file ?? '';
        comps.forEach((comp, i) => {
            if (models[i]) {
                comp.dataset.subjectFile = subjectFile;
                comp.setQuestion(models[i]);
                comp.setStarred(QuestionLibrary.isFavorite(subjectFile, models[i].id));
            }
        });
    }

    /** Re-sync star state on visible library cards without re-rendering them. */
    private syncLibraryStars(): void {
        const container = this.libraryContainer;
        if (!container || !this.selectedSubject) return;
        const subjectFile = this.selectedSubject.subject.file;
        const comps = Array.from(container.querySelectorAll('question-component')) as QuestionComponent[];
        const shown = this.libraryModels.getObject() ?? [];
        comps.forEach((comp, i) => {
            if (shown[i]) comp.setStarred(QuestionLibrary.isFavorite(subjectFile, shown[i].id));
        });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Favourites
    // ──────────────────────────────────────────────────────────────────────────

    private async refreshFavorites(): Promise<void> {
        // Favourites store only headers — resolve each back to a render-ready question.
        const resolved = await QuestionLibrary.resolveFavorites();
        const headers = resolved.map(r => r.entry.header);
        const models: QuestionModel[] = resolved.map(({ entry, model }) => ({
            ...model,
            tags: [{ text: entry.header.subjectName, color: 'tertiary' }, ...(model.tags ?? [])],
        }));
        this.favoritesView.setObject(models);
        this.bindFavorites(models, headers);
        this.favoritesCountText.setObject(String(models.length));
        this.hasFavorites.setObject(models.length > 0);
        this.noFavorites.setObject(models.length === 0);
    }

    private bindFavorites(models: QuestionModel[], headers: QuestionHeader[]): void {
        const container = this.favoritesContainer;
        if (!container) return;
        const comps = Array.from(container.querySelectorAll('question-component')) as QuestionComponent[];
        comps.forEach((comp, i) => {
            if (models[i]) {
                // Stamp the owning subject so un-starring a favourite hits the right entry,
                // even when it belongs to a different subject than the selected library one.
                comp.dataset.subjectFile = headers[i]?.subjectFile ?? '';
                comp.setQuestion(models[i]);
                comp.setStarred(true);
            }
        });
    }

    public onFavoriteToggle(e: CustomEvent, element: HTMLElement): void {
        const { id, starred } = e.detail as { id: string | number; starred: boolean };
        // element is the question-component node stamped with data-subject-file at bind time.
        const subjectFile = element.dataset.subjectFile || this.selectedSubject?.subject.file;
        if (!subjectFile) return;
        QuestionLibrary.setFavorite({ subjectFile, questionId: id }, starred);
        void this.refreshFavorites();
        this.syncLibraryStars();
    }

    public onSearchInput(): void {
        this.renderLibrary();
    }

    /** ReCheckbox is "controlled" — reflect the user's toggle back onto its checked state. */
    public onNoShuffleToggle(event: CustomEvent): void {
        const checked = !!(event.detail as { checked?: boolean })?.checked;
        this.noShuffleCheckbox?.checked.setObject(checked);
    }

    private toModel(q: ExamQuestion): QuestionModel {
        const correct = q.RId ?? 0;
        return {
            id: q.Id,
            title: KatexUtils.renderInlineString(q.Title),
            answers: (q.Answers ?? []).map((text, i) => ({
                text: KatexUtils.renderInlineString(text),
                correct: i === correct,
            })),
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Drop zones (required / excluded)
    // ──────────────────────────────────────────────────────────────────────────

    private wireDropZone(zone: HTMLElement | undefined, onDrop: (id: string) => void): void {
        if (!zone) return;
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', (e) => {
            if (!zone.contains(e.relatedTarget as Node)) zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const id = this.readDragId(e);
            if (id) onDrop(id);
        });
    }

    private readDragId(e: DragEvent): string | null {
        if (!e.dataTransfer) return null;
        return e.dataTransfer.getData(QuestionComponent.DRAG_MIME)
            || e.dataTransfer.getData('text/plain')
            || null;
    }

    private addRequired(id: string): void {
        if (!this.plainById.has(id)) return;
        this.excludedIds.delete(id);
        this.requiredIds.add(id);
        this.refreshZones();
    }

    private addExcluded(id: string): void {
        if (!this.plainById.has(id)) return;
        this.requiredIds.delete(id);
        this.excludedIds.add(id);
        this.refreshZones();
    }

    public removeRequired(item: PickedItem): void {
        this.requiredIds.delete(item.id);
        this.refreshZones();
    }

    public removeExcluded(item: PickedItem): void {
        this.excludedIds.delete(item.id);
        this.refreshZones();
    }

    private refreshZones(): void {
        const toItems = (ids: Set<string>) =>
            [...ids].map(id => this.plainById.get(id) ?? { id, title: `#${id}` });
        this.requiredItems.setObject(toItems(this.requiredIds));
        this.excludedItems.setObject(toItems(this.excludedIds));
        this.requiredCountText.setObject(String(this.requiredIds.size));
        this.excludedCountText.setObject(String(this.excludedIds.size));
        // Picked/removed questions must appear/reappear in the library immediately.
        this.renderLibrary();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Range / count helpers
    // ──────────────────────────────────────────────────────────────────────────

    private syncRangeDefaults(): void {
        if (!this.rangeSlider) return;
        this.rangeSlider.Min.setObject(1);
        this.rangeSlider.Max.setObject(1);
        this.rangeSlider.Lower.setObject(1);
        this.rangeSlider.Upper.setObject(1);
    }

    private syncRangeValueMarker(): void {
        if (!this.rangeSlider) return;
        const val = parseInt(this.countInput?.Value.value as string) || 0;
        this.rangeSlider.ValueMin.setObject(val);
    }

    private clampCountToRange(): void {
        if (!this.rangeSlider || !this.countInput) return;
        const lower = Number(this.rangeSlider.Lower.value) || 1;
        const upper = Number(this.rangeSlider.Upper.value) || 1;
        const span = upper - lower + 1;
        this.countInput.Max.setObject(span);
        const current = parseInt(this.countInput.Value.value as string) || 0;
        if (current > span) this.countInput.Value.setObject(String(span));
    }

    private syncTestTypeVisual(buttons: Map<ReButton, boolean>): void {
        buttons.forEach((selected, btn) => {
            btn.Variant.setObject(selected ? 'filled' : 'outlined');
        });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Preset CRUD
    // ──────────────────────────────────────────────────────────────────────────

    public newPreset(): void {
        this.editingPresetId = null;
        this.editorTitle.setObject('Новый пресет');
        this.statusText.setObject('');
        this.nameInput?.Value.setObject('');
        this.requiredIds.clear();
        this.excludedIds.clear();
        this.refreshZones();
    }

    public savePreset(): void {
        const name = (this.nameInput?.Value.value ?? '').trim();
        if (!name) {
            this.statusText.setObject('⚠ Укажите название пресета.');
            return;
        }
        if (!this.selectedSubject) {
            this.statusText.setObject('⚠ Выберите предмет в библиотеке.');
            return;
        }

        const preset: TestPreset = {
            id: this.editingPresetId ?? '',
            name,
            subjectFile: this.selectedSubject.subject.file,
            subjectName: this.selectedSubject.subject.translatedName || this.selectedSubject.subject.name,
            semester: this.selectedSubject.semester,
            totalQuestions: this.subjectModels.length,
            selection: this.readSelection(),
            requiredIds: [...this.requiredIds],
            excludedIds: [...this.excludedIds],
            createdAt: 0,
            updatedAt: 0,
        };

        const saved = PresetStore.save(preset);
        this.editingPresetId = saved.id;
        this.editorTitle.setObject('Редактирование: ' + saved.name);
        this.statusText.setObject('✓ Пресет сохранён в браузере.');
        this.refreshPresetList();
    }

    public deletePreset(view: PresetView): void {
        PresetStore.delete(view.id);
        if (this.editingPresetId === view.id) this.newPreset();
        this.refreshPresetList();
    }

    public async loadPreset(view: PresetView): Promise<void> {
        const preset = PresetStore.get(view.id);
        if (!preset) return;

        this.editingPresetId = preset.id;
        this.editorTitle.setObject('Редактирование: ' + preset.name);
        this.statusText.setObject('');
        this.nameInput?.Value.setObject(preset.name);

        const option = this.subjectOptions.find(o => o.value === preset.subjectFile) || null;
        if (option) {
            if (this.librarySemesterSelect) {
                this.librarySemesterSelect.value = option.semester;
                this.populateSubjectSelect(option.semester);
            }
            if (this.librarySubjectSelect) this.librarySubjectSelect.value = option.value;
        }

        // Restore the explicit picks (loadSubject is told not to reset them).
        this.requiredIds = new Set(preset.requiredIds.map(String));
        this.excludedIds = new Set(preset.excludedIds.map(String));
        await this.loadSubject(option, false);

        // Restore sampling controls.
        const sel = preset.selection;
        this.testTypeGroup?.Value.setObject(sel.testType);
        this.noShuffleCheckbox?.checked.setObject(sel.noShuffle);
        if (this.rangeSlider) {
            this.rangeSlider.Lower.setObject(sel.rangeStart);
            this.rangeSlider.Upper.setObject(sel.rangeEnd);
        }
        this.countInput?.Value.setObject(String(sel.count));
        if (this.testTypeGroup?.buttonMap) this.syncTestTypeVisual(this.testTypeGroup.buttonMap);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    private refreshPresetList(): void {
        const views: PresetView[] = PresetStore.getAll().map(p => ({
            id: p.id,
            name: p.name,
            subjectName: p.subjectName,
            countLabel: `Вопросов: ${p.selection.count || p.totalQuestions}`,
            requiredLabel: `Обязат.: ${p.requiredIds.length}`,
            excludedLabel: `Исключ.: ${p.excludedIds.length}`,
        }));
        this.presetList.setObject(views);
        this.presetCountText.setObject(String(views.length));
        this.hasPresets.setObject(views.length > 0);
        this.noPresets.setObject(views.length === 0);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Running a test
    // ──────────────────────────────────────────────────────────────────────────

    /** Run a saved preset directly from the list. */
    public runPreset(view: PresetView): void {
        const preset = PresetStore.get(view.id);
        if (!preset) return;
        const option = this.subjectOptions.find(o => o.value === preset.subjectFile);
        if (!option) {
            this.statusText.setObject('⚠ Предмет пресета не найден.');
            return;
        }
        this.launch(option.subject, preset.selection, preset.requiredIds, preset.excludedIds);
    }

    public async runDefaultPreset(presetId: string): Promise<void> {
        try {
            // Look up the actual filename from the ID
            const filename = this.defaultPresetFilenames.get(presetId);
            if (!filename) {
                this.statusText.setObject('⚠ Пресет не найден.');
                return;
            }

            const preset = await Fetcher.fetchJSON(DEFAULT_PRESETS_URL + filename) as TestPreset;
            const option = this.subjectOptions.find(o => o.value === preset.subjectFile);
            if (!option) {
                this.statusText.setObject('⚠ Предмет пресета не найден.');
                return;
            }

            this.launch(option.subject, preset.selection, preset.requiredIds, preset.excludedIds);
        } catch (e) {
            console.error('[Generators] Failed to run default preset', e);
            this.statusText.setObject('⚠ Ошибка при запуске дефолт пресета.');
        }
    }

    private readSelection() {
        const lower = Number(this.rangeSlider?.Lower.value) || 1;
        const upper = Number(this.rangeSlider?.Upper.value) || lower;
        const count = parseInt(this.countInput?.Value.value as string) || 0;
        const testType = (this.testTypeGroup?.Value.value === 'exam' ? 'exam' : 'main') as 'main' | 'exam';
        const noShuffle = !!this.noShuffleCheckbox?.checked.value;
        return { count, rangeStart: lower, rangeEnd: upper, noShuffle, testType };
    }

    private launch(
        subject: Subject,
        sel: { count: number; rangeStart: number; rangeEnd: number; noShuffle: boolean; testType: 'main' | 'exam' },
        forcedIds: Array<number | string>,
        excludedIds: Array<number | string>,
    ): void {
        const params = {
            subject,
            type: 'generated',
            limits: sel.count,
            startFrom: Math.max(0, sel.rangeStart - 1),
            endAt: sel.rangeEnd,
            randomSource: null,
            noShuffle: sel.noShuffle,
            testType: sel.testType,
            forcedIds,
            excludedIds,
        };
        const paramsStr = encodeURIComponent(JSON.stringify(params));
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/testing/actual?params=' + paramsStr)), true);
    }

    // ──────────────────────────────────────────────────────────────────────────

    private truncate(text: string, max: number): string {
        const clean = (text ?? '').replace(/\s+/g, ' ').trim();
        return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
    }

    public exportPreset(): void {
        if (!this.selectedSubject) {
            this.statusText.setObject('⚠ Выберите предмет в библиотеке для экспорта.');
            return;
        }
        const name = (this.nameInput?.Value.value ?? '').trim() || 'preset';
        const preset: TestPreset = {
            id: this.editingPresetId ?? '',
            name,
            subjectFile: this.selectedSubject.subject.file,
            subjectName: this.selectedSubject.subject.translatedName || this.selectedSubject.subject.name,
            semester: this.selectedSubject.semester,
            totalQuestions: this.subjectModels.length,
            selection: this.readSelection(),
            requiredIds: [...this.requiredIds],
            excludedIds: [...this.excludedIds],
            createdAt: 0,
            updatedAt: 0,
        };
        const json = JSON.stringify(preset, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.statusText.setObject('✓ Пресет экспортирован.');
    }

    public importPreset(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target?.result as string) as TestPreset;
                    // Restore from imported JSON
                    this.editingPresetId = null; // Don't overwrite existing preset
                    this.editorTitle.setObject('Импортирован: ' + json.name);
                    this.statusText.setObject('');
                    this.nameInput?.Value.setObject(json.name);
                    const option = this.subjectOptions.find(o => o.value === json.subjectFile) || null;
                    if (option) {
                        if (this.librarySemesterSelect) {
                            this.librarySemesterSelect.value = option.semester;
                            this.populateSubjectSelect(option.semester);
                        }
                        if (this.librarySubjectSelect) this.librarySubjectSelect.value = option.value;
                    }
                    this.requiredIds = new Set(json.requiredIds.map(String));
                    this.excludedIds = new Set(json.excludedIds.map(String));
                    void this.loadSubject(option, false);
                    const sel = json.selection;
                    this.testTypeGroup?.Value.setObject(sel.testType);
                    this.noShuffleCheckbox?.checked.setObject(sel.noShuffle);
                    if (this.rangeSlider) {
                        this.rangeSlider.Lower.setObject(sel.rangeStart);
                        this.rangeSlider.Upper.setObject(sel.rangeEnd);
                    }
                    this.countInput?.Value.setObject(String(sel.count));
                    if (this.testTypeGroup?.buttonMap) this.syncTestTypeVisual(this.testTypeGroup.buttonMap);
                    this.statusText.setObject('✓ Пресет импортирован из файла.');
                } catch (err) {
                    console.error('[Generators] Import failed', err);
                    this.statusText.setObject('⚠ Ошибка при загрузке файла. Проверьте формат JSON.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Default presets loading
    // ──────────────────────────────────────────────────────────────────────────

    private async loadDefaultPresets(): Promise<void> {
        try {
            // Fetch the list of available preset files
            const index = await Fetcher.fetchJSON(DEFAULT_PRESETS_URL + 'index.json') as { presets: string[] };
            const presets: PresetView[] = [];
            this.defaultPresetFilenames.clear();

            for (const filename of index.presets) {
                try {
                    const presetData = await Fetcher.fetchJSON(DEFAULT_PRESETS_URL + filename) as TestPreset;
                    const presetId = presetData.id || filename;
                    presets.push({
                        id: presetId,
                        name: presetData.name,
                        subjectName: presetData.subjectName,
                        countLabel: `Вопросов: ${presetData.selection.count || presetData.totalQuestions}`,
                        requiredLabel: `Обязат.: ${presetData.requiredIds.length}`,
                        excludedLabel: `Исключ.: ${presetData.excludedIds.length}`,
                    });
                    // Store the mapping from ID to filename
                    this.defaultPresetFilenames.set(presetId, filename);
                } catch (e) {
                    console.warn('[Generators] Failed to load preset', filename, e);
                }
            }

            this.defaultPresets.setObject(presets);
            this.hasDefaultPresets.setObject(presets.length > 0);
        } catch (e) {
            console.warn('[Generators] Failed to load default presets index', e);
            this.defaultPresets.setObject([]);
            this.hasDefaultPresets.setObject(false);
        }
    }

    public async loadDefaultPreset(presetId: string): Promise<void> {
        try {
            // Look up the actual filename from the ID
            const filename = this.defaultPresetFilenames.get(presetId);
            if (!filename) {
                this.statusText.setObject('⚠ Пресет не найден.');
                return;
            }

            const preset = await Fetcher.fetchJSON(DEFAULT_PRESETS_URL + filename) as TestPreset;

            this.editingPresetId = null;
            this.editorTitle.setObject('Дефолт: ' + preset.name);
            this.statusText.setObject('');
            this.nameInput?.Value.setObject(preset.name);

            const option = this.subjectOptions.find(o => o.value === preset.subjectFile) || null;
            if (option) {
                if (this.librarySemesterSelect) {
                    this.librarySemesterSelect.value = option.semester;
                    this.populateSubjectSelect(option.semester);
                }
                if (this.librarySubjectSelect) this.librarySubjectSelect.value = option.value;
            }

            this.requiredIds = new Set(preset.requiredIds.map(String));
            this.excludedIds = new Set(preset.excludedIds.map(String));
            await this.loadSubject(option, false);

            const sel = preset.selection;
            this.testTypeGroup?.Value.setObject(sel.testType);
            this.noShuffleCheckbox?.checked.setObject(sel.noShuffle);
            if (this.rangeSlider) {
                this.rangeSlider.Lower.setObject(sel.rangeStart);
                this.rangeSlider.Upper.setObject(sel.rangeEnd);
            }
            this.countInput?.Value.setObject(String(sel.count));
            if (this.testTypeGroup?.buttonMap) this.syncTestTypeVisual(this.testTypeGroup.buttonMap);

            this.statusText.setObject('✓ Дефолт пресет загружен.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            console.error('[Generators] Failed to load default preset', e);
            this.statusText.setObject('⚠ Ошибка при загрузке дефолт пресета.');
        }
    }
}
