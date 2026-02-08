import { Component, TemplateHolder } from "@Purper";
export default class AppLayout extends Component {
    static get observedAttributes(): string[];
    private sidebarBtn;
    private topbarBtn;
    private sidebar;
    private topbar;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    toggleAppbar(barId: number): void;
}
//# sourceMappingURL=AppLayout.html.d.ts.map