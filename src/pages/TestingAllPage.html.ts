import { AccessType, Fetcher, Observable, Page, RePage, TemplateHolder } from "@Purper"
import { Semestr, Subject, TestingFile, ExamQuestion, ColloquiumQuestion } from "../frac/Testing.js"
import { KatexUtils } from "../KatexUtils.js"
import ReInput from "../components/ReInput.html.js"
import ReButtonGroup from "../components/ReButtonGroup.html.js"
import ReButton from "../components/ReButton.html.js"

interface UnifiedSubject {
    subject: Subject;
    semester: string;
    type: "exam" | "colloquium";
}

interface DisplayAnswer {
    text: string;
    isCorrect: boolean;
}

interface DisplayItem {
    Id: number;
    Title: string;
    type: "exam" | "colloquium";
    subjectName: string;
    semester: string;
    // Exam-specific
    examAnswers: DisplayAnswer[];
    // Colloquium-specific
    referenceAnswers: string[];
    Keywords: string[];
    isExam: boolean;
    isColloquium: boolean;
}

@RePage({
    markupURL: "./src/pages/TestingAllPage.hmle",
    cssURL: "./src/pages/TestingAllPage.html.css",
}, "/testing/all")
export default class TestingAllPage extends Page {
    private allSubjects: UnifiedSubject[] = [];
    private allItems: DisplayItem[] = [];
    private filteredItems: DisplayItem[] = [];

    private displayItems: Observable<DisplayItem[]> = new Observable<DisplayItem[]>([]);
    private countText: Observable<string> = new Observable<string>("Загрузка...");
    private truncatedText: Observable<string> = new Observable<string>("");
    private showTruncated: Observable<boolean> = new Observable<boolean>(false);

    private searchInput?: ReInput;
    private typeFilter?: ReButtonGroup;
    private semesterSelect?: HTMLSelectElement;
    private subjectSelect?: HTMLSelectElement;

    private semesters: string[] = [];
    private subjectNames: string[] = [];

    private static readonly INITIAL_BATCH = 60;
    private static readonly BATCH_STEP = 40;
    private static readonly SCROLL_THRESHOLD_PX = 800;
    private visibleCount: number = 0;
    private intersectionObserver: IntersectionObserver | null = null;
    private batchPending: boolean = false;

    protected async preInit(): Promise<void> {
        const [examData, colloquiumData] = await Promise.all([
            Fetcher.fetchJSON('./resources/data/testing.json') as Promise<Semestr[]>,
            Fetcher.fetchJSON('./resources/data/colloquim_testing.json') as Promise<Semestr[]>,
        ]);

        for (const sem of examData) {
            for (const sub of sem.subjects) {
                this.allSubjects.push({ subject: sub, semester: sem.number, type: "exam" });
            }
        }
        for (const sem of colloquiumData) {
            for (const sub of sem.subjects) {
                this.allSubjects.push({ subject: sub, semester: sem.number, type: "colloquium" });
            }
        }

        const semSet = new Set<string>();
        const subSet = new Set<string>();
        for (const us of this.allSubjects) {
            semSet.add(us.semester);
            subSet.add(us.subject.translatedName || us.subject.name);
        }
        this.semesters = [...semSet];
        this.subjectNames = [...subSet].sort();

        await this.loadAllQuestions();
        this.filteredItems = this.allItems.slice();
        this.visibleCount = Math.min(TestingAllPage.INITIAL_BATCH, this.filteredItems.length);
        this.displayItems.setObject(this.filteredItems.slice(0, this.visibleCount));
        this.updateCounters();
    }

    protected async postLoad(holder: TemplateHolder): Promise<void> {
        if (this.typeFilter?.buttonMap) {
            this.typeFilter.buttonMap.forEach((selected, btn) => {
                btn.Variant.setObject(selected ? 'filled' : 'outlined');
            });
        }

        this.updateSubjectOptions();
        this.applyFilters();
        this.setupIntersectionObserver();
        window.addEventListener('scroll', this.onScroll, { passive: true });
    }

    public async dispose(): Promise<void> {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }
        window.removeEventListener('scroll', this.onScroll);
    }

    private async loadAllQuestions(): Promise<void> {
        const items: DisplayItem[] = [];

        const fetches = this.allSubjects.map(async (us) => {
            try {
                const data = await Fetcher.fetchJSON('./resources/data/' + us.subject.file) as TestingFile;
                const subjectLabel = us.subject.translatedName || us.subject.name;
                for (const q of data.Questions) {
                    if (us.type === "exam") {
                        const eq = q as ExamQuestion;
                        const correctIdx = eq.RId ?? 0;
                        items.push({
                            Id: q.Id,
                            Title: KatexUtils.renderInlineString(q.Title),
                            type: "exam",
                            subjectName: subjectLabel,
                            semester: us.semester,
                            isExam: true,
                            isColloquium: false,
                            examAnswers: q.Answers.map((a, i) => ({
                                text: KatexUtils.renderInlineString(a),
                                isCorrect: i === correctIdx,
                            })),
                            referenceAnswers: [],
                            Keywords: [],
                        });
                    } else {
                        const cq = q as ColloquiumQuestion;
                        items.push({
                            Id: q.Id,
                            Title: q.Title,
                            type: "colloquium",
                            subjectName: subjectLabel,
                            semester: us.semester,
                            isExam: false,
                            isColloquium: true,
                            examAnswers: [],
                            referenceAnswers: q.Answers,
                            Keywords: cq.Keywords ?? [],
                        });
                    }
                }
            } catch (e) {
                console.warn('Failed to load', us.subject.file, e);
            }
        });

        await Promise.all(fetches);
        this.allItems = items;
    }

    public onTypeChange(event: CustomEvent<{}>): void {
        const buttons = (event.detail as any).buttons as Map<ReButton, boolean>;
        buttons.forEach((isSelected, btn) => {
            btn.Variant.setObject(isSelected ? 'filled' : 'outlined');
        });
        this.applyFilters();
    }

    public onSearchInput(): void {
        this.applyFilters();
    }

    public onSemesterChange(): void {
        this.updateSubjectOptions();
        this.applyFilters();
    }

    public onSubjectChange(): void {
        this.applyFilters();
    }

    private updateSubjectOptions(): void {
        if (!this.subjectSelect) return;
        const selectedSem = this.semesterSelect?.value || '';
        const relevantSubjects = new Set<string>();
        for (const us of this.allSubjects) {
            if (!selectedSem || us.semester === selectedSem) {
                relevantSubjects.add(us.subject.translatedName || us.subject.name);
            }
        }
        const currentVal = this.subjectSelect.value;
        this.subjectSelect.innerHTML = '<option value="">Все предметы</option>';
        for (const name of [...relevantSubjects].sort()) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            this.subjectSelect.appendChild(opt);
        }
        if (relevantSubjects.has(currentVal)) {
            this.subjectSelect.value = currentVal;
        }
    }

    private applyFilters(): void {
        const searchText = (this.searchInput?.Value?.value ?? '').toLowerCase().trim();
        const rawTypeValue = this.typeFilter?.Value?.value || '';
        const typeValue = (rawTypeValue === 'exam' || rawTypeValue === 'colloquium') ? rawTypeValue : 'all';
        const semValue = this.semesterSelect?.value || '';
        const subValue = this.subjectSelect?.value || '';

        this.filteredItems = this.allItems.filter(item => {
            if (typeValue !== 'all' && item.type !== typeValue) return false;
            if (semValue && item.semester !== semValue) return false;
            if (subValue && item.subjectName !== subValue) return false;
            if (searchText) {
                const haystack = (
                    item.Title + ' ' +
                    item.examAnswers.map(a => a.text).join(' ') + ' ' +
                    item.referenceAnswers.join(' ') + ' ' +
                    item.Keywords.join(' ')
                ).toLowerCase();
                if (!haystack.includes(searchText)) return false;
            }
            return true;
        });

        this.visibleCount = 0;
        this.appendNextBatch();
    }

    private setupIntersectionObserver(): void {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        const sentinel = document.querySelector('.scroll-sentinel');
        if (!sentinel) return;

        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting && this.visibleCount < this.filteredItems.length) {
                        this.appendNextBatch();
                    }
                }
            },
            { rootMargin: '0px 0px 800px 0px' }
        );

        this.intersectionObserver.observe(sentinel);
    }

    private readonly onScroll = (): void => {
        if (this.visibleCount >= this.filteredItems.length) return;
        if (this.batchPending) return;

        const scrollY = window.pageYOffset ?? document.documentElement.scrollTop ?? 0;
        const viewH = window.innerHeight ?? 0;
        const docH = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
        );

        if (scrollY + viewH + TestingAllPage.SCROLL_THRESHOLD_PX >= docH) {
            this.appendNextBatch();
        }
    };

    public loadMore(): void {
        this.appendNextBatch();
    }

    private appendNextBatch(): void {
        if (this.visibleCount >= this.filteredItems.length) {
            this.updateCounters();
            return;
        }
        if (this.batchPending) return;
        this.batchPending = true;

        const nextSize = this.visibleCount === 0
            ? TestingAllPage.INITIAL_BATCH
            : this.visibleCount + TestingAllPage.BATCH_STEP;

        this.visibleCount = Math.min(nextSize, this.filteredItems.length);
        this.displayItems.setObject(this.filteredItems.slice(0, this.visibleCount));
        this.updateCounters();

        requestAnimationFrame(() => {
            this.batchPending = false;
        });
    }

    private updateCounters(): void {
        this.countText.setObject(`${this.filteredItems.length} / ${this.allItems.length}`);

        if (this.visibleCount < this.filteredItems.length) {
            this.showTruncated.setObject(true);
            this.truncatedText.setObject(
                `Показано ${this.visibleCount} из ${this.filteredItems.length}. Пролистайте вниз для загрузки остальных.`
            );
        } else {
            this.showTruncated.setObject(false);
        }
    }

    public answerColor(answer: DisplayAnswer): string {
        return answer.isCorrect ? 'success' : 'empty';
    }

    public answerVariant(answer: DisplayAnswer): string {
        return answer.isCorrect ? 'outlined' : 'filled';
    }
}