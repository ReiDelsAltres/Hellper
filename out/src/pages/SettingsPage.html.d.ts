import { Page, TemplateHolder } from "@Purper";
export default class SettingsPage extends Page {
    private strategyGroup?;
    private precacheGroup?;
    protected postLoad(holder: TemplateHolder): Promise<void>;
    onStrategyChange(event: CustomEvent<{}>): void;
    onPrecacheModeChange(event: CustomEvent<{}>): void;
    private updateGroupSelection;
}
//# sourceMappingURL=SettingsPage.html.d.ts.map