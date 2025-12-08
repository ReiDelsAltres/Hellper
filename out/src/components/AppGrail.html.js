var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AccessType, Component, ReComponent } from "@Purper";
let AppGrail = class AppGrail extends Component {
    opened;
    toggle(event, element) {
        switch (this.opened) {
            case true:
                element.setAttribute("variant", "filled");
                break;
            case false:
            default:
                element.setAttribute("variant", "outlined");
                break;
        }
    }
};
AppGrail = __decorate([
    ReComponent("./src/components/AppGrail.html", "./src/components/AppGrail.html.css", "./src/components/AppGrail.html.ts", AccessType.BOTH, "app-grail")
], AppGrail);
export default AppGrail;
//# sourceMappingURL=AppGrail.html.js.map