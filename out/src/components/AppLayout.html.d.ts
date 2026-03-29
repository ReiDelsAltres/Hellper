import { TemplateHolder, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
type PanelDirection = "vertical" | "horizontal";
type PanelState = "mini" | "hidden";
export default class AppLayout extends ComponentCore {
    Sidebar: Attribute<PanelState | null>;
    Topbar: Attribute<PanelState | null>;
    private sidebarBtn;
    private topbarBtn;
    private verticalPanel;
    private horizontalPanel;
    private readonly panels;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    togglePanel(direction: PanelDirection): void;
}
export {};
//# sourceMappingURL=AppLayout.html.d.ts.map