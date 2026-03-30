import { AccessType, Fetcher, IElementHolder, Page, RePage, Router, TemplateHolder, Observable } from "@Purper";
import { Subject, ColloquiumFile } from "../frac/Testing.js";
import ReButton from "../components/ReButton.html.js";
import ReButtonGroup from "../components/ReButtonGroup.html.js";
import ReInput from "../components/ReInput.html.js";
import ReCheckbox from "src/components/ReCheckbox.html.js";
import Paper from "src/components/PaperComponent.html.js";

@RePage({
    markupURL: "./src/pages/ColloquiumSubPage.hmle",
    cssURL: "./src/pages/ColloquiumSubPage.html.css",
}, "/colloquim/sub")
export default class ColloquiumSubPage extends Page {
    private subject: Subject;
    private totalQuestions: number = 0;
    private totalBilets: number = 0;
    private hasBilets: boolean = false;
    private static readonly RUNTIME_BILET_SIZE = 5;

    private testModes: TestMode[] = [
        { signature: "fast", name: "Быстрый", description: "Быстрая проверка", numItems: new Observable(5), colorP: "success" },
        { signature: "normal", name: "Обычный", description: "Стандартный тест", numItems: new Observable(25), colorP: "warning" },
        { signature: "hard", name: "Всё", description: "Все вопросы", numItems: new Observable(0), colorP: "error" },
    ];

    private testModesGroup?: ReButtonGroup;
    private modeSettingsButton?: ReButton;
    private optionBlock?: Paper;
    private inputTestType?: ReButtonGroup;
    private inputContentType?: ReButtonGroup;
    private biletsButton?: ReButton;
    private inputVal?: ReInput;
    private inputNoShuffle?: ReCheckbox;

    constructor(subject?: string) {
        super();
        this.subject = JSON.parse(decodeURIComponent(subject));
    }

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        const result = await Fetcher.fetchJSON('./resources/data/' + this.subject.file) as ColloquiumFile;
        this.totalQuestions = result.Questions.length;
        this.totalBilets = result.Bilets?.length ?? 0;
        this.hasBilets = (result.Bilets?.length ?? 0) > 0;

        this.testModes[2].numItems.setObject(this.totalQuestions);
    }

    protected async postLoad(holder: TemplateHolder): Promise<void> {
        this.updateTestModeGroup(this.testModesGroup?.buttonMap);
        this.updateTestTypeChange(this.inputTestType?.buttonMap);
        if (this.inputContentType) {
            this.updateContentTypeChange(this.inputContentType.buttonMap);
        }

        if (this.biletsButton && !this.hasBilets) {
            this.biletsButton.Disabled.setObject(true);
        }
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
        this.inputVal?.Value.setObject(activeMode?.numItems.getObject()?.toString());
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

        this.inputVal?.Value.setObject(activeMode?.numItems.getObject()?.toString());
    }

    public startTest(): void {
        const activeMode = this.testModes.find(mode => mode.signature === this.testModesGroup?.Value.value);
        const contentType = this.inputContentType?.Value.value || 'questions';
        const limits = parseInt(this.inputVal?.Value.value as string) || activeMode?.numItems.getObject() || 25;
        const testType = this.inputTestType?.Value.value || 'main';
        const noShuffle = this.inputNoShuffle?.hasAttribute('checked') ?? false;

        const params = {
            subject: this.subject,
            type: activeMode?.signature ?? 'normal',
            contentType,
            limits,
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
