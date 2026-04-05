import { Page, TemplateHolder } from "@Purper";
import ReButton from "../components/ReButton.html.js";
export default class TestingSubPage extends Page {
    get Debug(): boolean;
    private subject;
    private fetchedData;
    private testModes;
    private testModesGroup?;
    private modeSettingsButton?;
    private optionBlock?;
    private inputTestType?;
    private inputMin?;
    private inputVal?;
    private inputMax?;
    private inputNoShuffle?;
    private noShuffle;
    private modeElements?;
    private startTestButton?;
    private cacheIndicator?;
    constructor(subject?: string);
    private dataUrl;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    private updateCacheIndicator;
    protected postLoad(holder: TemplateHolder): Promise<void>;
    onSelectionChange(event: CustomEvent<{}>): void;
    onTestTypeChange(event: CustomEvent<{}>): void;
    updateTestTypeChange(buttons: Map<ReButton, boolean>): void;
    updateTestModeGroup(buttons: Map<ReButton, boolean>): void;
    downloadQuestions(): void;
    startTest(): void;
}
//# sourceMappingURL=TestingSubPage.html.d.ts.map