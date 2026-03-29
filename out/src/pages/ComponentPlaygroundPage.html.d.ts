import { Page, TemplateHolder } from "@Purper";
export default class ComponentPlaygroundPage extends Page {
    private componentSelect;
    private propsContainer;
    private previewContainer;
    private codeOutput;
    private contentInput;
    private componentInfo;
    private historyContainer;
    private resetBtn;
    private copyCodeBtn;
    private bgOptions;
    private hidePropsPanel;
    private hasComponent;
    private previewBg;
    private currentComponent;
    private currentProps;
    private history;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    private populateComponentSelector;
    private onComponentChange;
    private renderPropsPanel;
    private renderComponentInfo;
    private updatePreview;
    private highlightCode;
    private addToHistory;
    private renderHistory;
    private showPlaceholder;
    private resetPlayground;
    private copyCode;
    private changeBackground;
}
//# sourceMappingURL=ComponentPlaygroundPage.html.d.ts.map