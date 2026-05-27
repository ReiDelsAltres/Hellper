var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReComponent, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
let AppLayout = class AppLayout extends ComponentCore {
    Sidebar = new Attribute(this, "sidebar");
    Topbar = new Attribute(this, "topbar");
    sidebarBtn;
    topbarBtn;
    verticalPanel;
    horizontalPanel;
    panels = new Map();
    async preLoad(holder) {
        this.panels.set("vertical", { bar: () => this.verticalPanel, btn: () => this.sidebarBtn, attr: this.Sidebar });
        this.panels.set("horizontal", { bar: () => this.horizontalPanel, btn: () => this.topbarBtn, attr: this.Topbar });
        for (const [, panel] of this.panels) {
            const type = panel.bar().Type.value ?? "mini";
            panel.attr.setObject(type);
        }
        this.verticalPanel.addEventListener("mouseenter", () => {
            this.verticalPanel.notifyAllChildren((el) => el.removeAttribute("mini"));
        });
        this.verticalPanel.addEventListener("mouseleave", () => {
            if (this.verticalPanel.Type.value === "mini") {
                this.verticalPanel.notifyAllChildren((el) => el.setAttribute("mini", ""));
            }
        });
    }
    togglePanel(direction) {
        const panel = this.panels.get(direction);
        if (!panel)
            return;
        const bar = panel.bar();
        const btn = panel.btn();
        const isHidden = bar.Hidden.value !== null;
        bar.Hidden.setObject(!isHidden ? true : null);
        panel.attr.setObject(isHidden ? "mini" : "hidden");
        btn.Variant.setObject(isHidden ? "outlined" : "filled");
    }
};
AppLayout = __decorate([
    ReComponent({
        markupURL: "./src/components/AppLayout.hmle",
        cssURL: "./src/components/AppLayout.html.css",
        ltCssURL: "./src/components/AppLayout.html.lt.css",
    }, "app-layout")
], AppLayout);
export default AppLayout;
//# sourceMappingURL=AppLayout.html.js.map