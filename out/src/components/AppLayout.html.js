var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AccessType, Component, ReComponent } from "@Purper";
let AppLayout = class AppLayout extends Component {
    static get observedAttributes() {
        return ["sidebar-hidden", "topbar-hidden"];
    }
    sidebarBtn;
    topbarBtn;
    sidebar;
    topbar;
    async preLoad(holder) {
        // ensure the host reflects the current sidebar/topbar type so outside CSS (eg. page) can react
        try {
            const sType = this.sidebar?.getAttribute('type') ?? null;
            if (sType)
                this.setAttribute('sidebar', sType);
            const tType = this.topbar?.getAttribute('type') ?? null;
            if (tType)
                this.setAttribute('topbar', tType);
        }
        catch {
            // ignore if refs are not available
        }
    }
    toggleAppbar(barId) {
        switch (barId) {
            case 0:
                var isHidden = this.sidebar.getAttribute("type") === "hidden";
                if (isHidden) {
                    this.sidebar.setAttribute("type", "mini");
                    this.setAttribute('sidebar', 'mini');
                    this.sidebarBtn.setAttribute("variant", "outlined");
                }
                else {
                    this.sidebar.setAttribute("type", "hidden");
                    this.setAttribute('sidebar', 'hidden');
                    this.sidebarBtn.setAttribute("variant", "filled");
                }
                break;
            case 1:
                var isHidden = this.topbar.getAttribute("type") === "hidden";
                if (isHidden) {
                    this.topbar.setAttribute("type", "mini");
                    this.setAttribute('topbar', 'mini');
                    this.topbarBtn.setAttribute("variant", "outlined");
                }
                else {
                    this.topbar.setAttribute("type", "hidden");
                    this.setAttribute('topbar', 'hidden');
                    this.topbarBtn.setAttribute("variant", "filled");
                }
                break;
        }
    }
};
AppLayout = __decorate([
    ReComponent("./src/components/AppLayout.hmle", "./src/components/AppLayout.html.css", "./src/components/AppLayout.html.ts", AccessType.BOTH, "app-layout", "./src/components/AppLayout.html.lt.css")
], AppLayout);
export default AppLayout;
//# sourceMappingURL=AppLayout.html.js.map