import { Page, TemplateHolder } from "@Purper";
import ReButton from "../components/ReButton.html.js";
export default class ColloquiumSubPage extends Page {
    private subject;
    private totalQuestions;
    private totalBilets;
    private hasBilets;
    private static readonly RUNTIME_BILET_SIZE;
    private testModes;
    private testModesGroup?;
    private modeSettingsButton?;
    private optionBlock?;
    private inputTestType?;
    private inputContentType?;
    private biletsButton?;
    private inputVal?;
    private inputNoShuffle?;
    constructor(subject?: string);
    protected preLoad(holder: TemplateHolder): Promise<void>;
    protected postLoad(holder: TemplateHolder): Promise<void>;
    onSelectionChange(event: CustomEvent<{}>): void;
    onTestTypeChange(event: CustomEvent<{}>): void;
    onContentTypeChange(event: CustomEvent<{}>): void;
    updateTestTypeChange(buttons: Map<ReButton, boolean>): void;
    updateContentTypeChange(buttons: Map<ReButton, boolean>): void;
    private updateItemCounts;
    updateTestModeGroup(buttons: Map<ReButton, boolean>): void;
    startTest(): void;
}
//# sourceMappingURL=ColloquiumSubPage.html.d.ts.map