var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent } from "@Purper";
let AppLayout = class AppLayout extends Component {
    static get observedAttributes() {
        return ["sidebar", "topbar"];
    }
    sidebarBtn;
    topbarBtn;
    sidebar;
    topbar;
    async preLoad(holder) {
        // ensure the host reflects the current sidebar/topbar type so outside CSS (eg. page) can react
        const sType = this.sidebar?.getAttribute('type') ?? null;
        if (sType)
            this.setAttribute('sidebar', sType);
        const tType = this.topbar?.getAttribute('type') ?? null;
        if (tType)
            this.setAttribute('topbar', tType);
    }
    toggleAppbar(barId) {
        switch (barId) {
            case 0:
                var isHidden = this.sidebar.hidden;
                if (isHidden) {
                    this.sidebar.hidden = false;
                    this.setAttribute('sidebar', 'mini');
                    this.sidebarBtn.setAttribute("variant", "outlined");
                }
                else {
                    this.sidebar.hidden = true;
                    this.setAttribute('sidebar', 'hidden');
                    this.sidebarBtn.setAttribute("variant", "filled");
                }
                break;
            case 1:
                var isHidden = this.topbar.hidden;
                if (isHidden) {
                    this.topbar.hidden = false;
                    this.setAttribute('topbar', 'mini');
                    this.topbarBtn.setAttribute("variant", "outlined");
                }
                else {
                    this.topbar.hidden = true;
                    this.setAttribute('topbar', 'hidden');
                    this.topbarBtn.setAttribute("variant", "filled");
                }
                break;
        }
    }
};
AppLayout = __decorate([
    ReComponent({
        markupURL: "./src/components/AppLayout.hmle",
        cssURL: "./src/components/AppLayout.html.css",
        ltCssURL: "./src/components/AppLayout.html.lt.css",
        jsURL: "./src/components/AppLayout.html.ts",
        class: AppLayout,
    }, "app-layout")
], AppLayout);
export default AppLayout;
//# sourceMappingURL=AppLayout.html.js.map