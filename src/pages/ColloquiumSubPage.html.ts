import { AccessType, Fetcher, IElementHolder, ModuleManager, Page, RePage, Router, TemplateHolder, Observable } from "@Purper";
import { Subject, ColloquiumFile } from "../frac/Testing.js";
import ReButton from "../components/ReButton.html.js";
import ReButtonGroup from "../components/ReButtonGroup.html.js";
import ReInput from "../components/ReInput.html.js";
import ReRangeSlider from "../components/ReRangeSlider.html.js";
import ReCheckbox from "src/components/ReCheckbox.html.js";
import Paper from "src/components/PaperComponent.html.js";
import CacheIndicator from "../components/CacheIndicator.html.js";

@RePage({
    markupURL: "./src/pages/ColloquiumSubPage.hmle",
    cssURL: "./src/pages/ColloquiumSubPage.html.css",
}, "/colloquim/sub")
export default class ColloquiumSubPage extends Page {
    public get Debug(): boolean { return ModuleManager.isActive("Debug"); }
    private subject: Subject;
    private fetchedData!: ColloquiumFile;
    private totalQuestions: number = 0;
    private totalBilets: number = 0;
    private hasBilets: boolean = false;
    private static readonly RUNTIME_BILET_SIZE = 5;

    private testModes: TestMode[] = [
        { signature: "fast", name: "Быстрый", description: "Быстрая проверка", numItems: new Observable<number | null>(5), colorP: "success" },
        { signature: "normal", name: "Обычный", description: "Стандартный тест", numItems: new Observable<number | null>(25), colorP: "warning" },
        { signature: "hard", name: "Всё", description: "Все вопросы", numItems: new Observable<number | null>(0), colorP: "error" },
    ];

    private testModesGroup?: ReButtonGroup;
    private modeSettingsButton?: ReButton;
    private optionBlock?: Paper;
    private inputTestType?: ReButtonGroup;
    private inputContentType?: ReButtonGroup;
    private biletsButton?: ReButton;
    private inputVal?: ReInput;
    private questionRange?: ReRangeSlider;
    private inputNoShuffle?: ReCheckbox;
    private cacheIndicator?: CacheIndicator;

    constructor(subject?: string) {
        super();
        this.subject = JSON.parse(decodeURIComponent(subject!));
    }

    private dataUrl = '';

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        this.dataUrl = './resources/data/' + this.subject.file;
        const result = await Fetcher.fetchJSON(this.dataUrl) as ColloquiumFile;
        this.fetchedData = result;
        this.totalQuestions = result.Questions.length;
        this.totalBilets = result.Bilets?.length ?? 0;
        this.hasBilets = (result.Bilets?.length ?? 0) > 0;

        this.testModes[2].numItems.setObject(this.totalQuestions);
    }

    private updateCacheIndicator(url: string, data: any): void {
        if (!this.cacheIndicator) return;

        this.cacheIndicator.loaded.setObject(true);
        this.cacheIndicator.fileName.setObject(url);

        const jsonStr = JSON.stringify(data);
        const sizeBytes = new Blob([jsonStr]).size;
        this.cacheIndicator.fileSize.setObject(sizeBytes);

        const resolvedUrl = Fetcher.resolveUrl(url);
        const entries = performance.getEntriesByName(resolvedUrl, 'resource') as PerformanceResourceTiming[];
        const entry = entries.length > 0 ? entries[entries.length - 1] : null;

        if (entry) {
            if (entry.transferSize === 0) {
                this.cacheIndicator.source.setObject('cache');
                this.cacheIndicator.networkCost.setObject(0);
            } else {
                this.cacheIndicator.source.setObject('network');
                this.cacheIndicator.networkCost.setObject(entry.transferSize);
            }
        } else {
            this.cacheIndicator.source.setObject('unknown');
        }
    }

    protected async postLoad(holder: TemplateHolder): Promise<void> {
        this.updateCacheIndicator(this.dataUrl, this.fetchedData);
        if (this.testModesGroup?.buttonMap) this.updateTestModeGroup(this.testModesGroup.buttonMap);
        if (this.inputTestType?.buttonMap) this.updateTestTypeChange(this.inputTestType.buttonMap);
        if (this.inputContentType) {
            this.updateContentTypeChange(this.inputContentType.buttonMap);
        }

        if (this.biletsButton && !this.hasBilets) {
            this.biletsButton.Disabled.setObject(true);
        }

        // Set up range slider
        if (this.questionRange) {
            this.questionRange.Min.setObject(1);
            this.questionRange.Max.setObject(this.totalQuestions);
            this.questionRange.Lower.setObject(1);
            this.questionRange.Upper.setObject(this.totalQuestions);
        }

        // Sync inputVal → range slider ValueMin
        this.inputVal?.Value.subscribe(() => this.syncValueMin());
    }

    public onSelectionChange(event: CustomEvent<{}>): void {
        this.updateTestModeGroup((event.detail as any).buttons as Map<ReButton, boolean>);
    }
    public onTestTypeChange(event: CustomEvent<{}>): void {
        this.updateTestTypeChange((event.detail as any).buttons as Map<ReButton, boolean>);
    }
    public onContentTypeChange(event: CustomEvent<{}>): void {
        this.updateContentTypeChange((event.detail as any).buttons as Map<ReButton, boolean>);
    }

    public updateTestTypeChange(buttons: Map<ReButton, boolean>): void {
        buttons.forEach((isSelected, btn) => {
            btn.Variant.setObject(isSelected ? 'filled' : 'outlined');
        });
    }

    public updateContentTypeChange(buttons: Map<ReButton, boolean>): void {
        buttons.forEach((isSelected, btn) => {
            btn.Variant.setObject(isSelected ? 'filled' : 'outlined');
        });
        this.updateItemCounts();
        const activeMode = this.testModes.find(mode => mode.signature === this.testModesGroup?.Value.value);
        this.inputVal?.Value.setObject(activeMode?.numItems.getObject()?.toString() ?? '');
        this.syncRangeToContent();
    }

    private updateItemCounts(): void {
        const contentType = this.inputContentType?.Value.value || 'questions';
        if (contentType === 'bilets') {
            this.testModes[0].numItems.setObject(Math.min(1, this.totalBilets));
            this.testModes[1].numItems.setObject(Math.min(5, this.totalBilets));
            this.testModes[2].numItems.setObject(this.totalBilets);
        } else if (contentType === 'runtime') {
            const totalRuntimeBilets = Math.ceil(this.totalQuestions / ColloquiumSubPage.RUNTIME_BILET_SIZE);
            this.testModes[0].numItems.setObject(Math.min(1, totalRuntimeBilets));
            this.testModes[1].numItems.setObject(Math.min(5, totalRuntimeBilets));
            this.testModes[2].numItems.setObject(totalRuntimeBilets);
        } else {
            this.testModes[0].numItems.setObject(Math.min(5, this.totalQuestions));
            this.testModes[1].numItems.setObject(Math.min(25, this.totalQuestions));
            this.testModes[2].numItems.setObject(this.totalQuestions);
        }
    }

    public updateTestModeGroup(buttons: Map<ReButton, boolean>): void {
        const activeMode = this.testModes.find(mode => mode.signature === this.testModesGroup?.Value.value);
        const color = activeMode?.colorP || 'primary';
        buttons.forEach((selected, btn) => {
            btn.Color.setObject(color);
            btn.Variant.setObject(selected ? 'filled' : 'outlined');
        });
        this.modeSettingsButton?.Color.setObject(color);
        this.optionBlock?.Color.setObject(color);

        this.inputVal?.Value.setObject(activeMode?.numItems.getObject()?.toString() ?? '');
        this.syncValueMin();
    }

    /** Keep range slider Max and ValueMin in sync with content type and inputVal. */
    private syncRangeToContent(): void {
        if (!this.questionRange) return;
        const total = this.testModes[2].numItems.getObject() || this.totalQuestions;
        this.questionRange.Min.setObject(1);
        this.questionRange.Max.setObject(total);
        this.questionRange.Lower.setObject(1);
        this.questionRange.Upper.setObject(total);
        this.syncValueMin();
    }

    private syncValueMin(): void {
        if (!this.questionRange) return;
        const val = parseInt(this.inputVal?.Value.value as string) || 0;
        this.questionRange.ValueMin.setObject(val);
    }

    public downloadQuestions(): void {
        const questions = this.fetchedData.Questions;
        const lines: string[] = [];
        for (const q of questions) {
            lines.push(`${q.Id}. ${q.Title}`);
            q.Answers.forEach((ans, i) => {
                const letter = String.fromCharCode(65 + i);
                const mark = i === 0 ? ' \u2713' : '';
                lines.push(`   ${letter}. ${ans}${mark}`);
            });
            lines.push('');
        }
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.subject.name}_questions.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    public startTest(): void {
        const activeMode = this.testModes.find(mode => mode.signature === this.testModesGroup?.Value.value);
        const contentType = this.inputContentType?.Value.value || 'questions';
        const lower = Number(this.questionRange?.Lower.value) || 1;
        const upper = Number(this.questionRange?.Upper.value) || lower;
        const limits = parseInt(this.inputVal?.Value.value as string) || activeMode?.numItems.getObject() || 25;
        const testType = this.inputTestType?.Value.value || 'main';
        const noShuffle = this.inputNoShuffle?.hasAttribute('checked') ?? false;

        const params = {
            subject: this.subject,
            type: activeMode?.signature ?? 'normal',
            contentType,
            limits,
            startFrom: lower - 1,
            endAt: upper,
            randomSource: null,
            noShuffle,
            testType
        };

        const paramsStr = encodeURIComponent(JSON.stringify(params));
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/colloquim/actual?params=' + paramsStr)), true);
    }
}

interface TestMode {
    signature: string;
    name: string;
    description: string;
    numItems: Observable<number | null>;
    colorP: string;
}
