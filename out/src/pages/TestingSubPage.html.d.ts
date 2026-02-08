import { Page, TemplateHolder } from "@Purper";
import ReButton from "../components/ReButton.html.js";
export default class TestingSubPage extends Page {
    private subject;
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
    constructor(subject?: string);
    protected preLoad(holder: TemplateHolder): Promise<void>;
    protected postLoad(holder: TemplateHolder): Promise<void>;
    onSelectionChange(event: CustomEvent<{}>): void;
    onTestTypeChange(event: CustomEvent<{}>): void;
    updateTestTypeChange(buttons: Map<ReButton, boolean>): void;
    updateTestModeGroup(buttons: Map<ReButton, boolean>): void;
}
//# sourceMappingURL=TestingSubPage.html.d.ts.map