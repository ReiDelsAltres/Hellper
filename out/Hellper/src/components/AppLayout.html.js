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
    }
    toggleAppbar(barId) {
        switch (barId) {
            case 0:
                const isHidden = this.sidebar.getAttribute('hidden');
                if (isHidden) {
                    this.sidebar.removeAttribute('hidden');
                }
                else {
                    this.sidebar.setAttribute('hidden', '');
                }
                break;
            case 1:
                const isTopHidden = this.topbar.getAttribute('hidden');
                if (isTopHidden) {
                    this.topbar.removeAttribute('hidden');
                }
                else {
                    this.topbar.setAttribute('hidden', '');
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