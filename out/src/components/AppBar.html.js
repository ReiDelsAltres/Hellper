var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AccessType, Component, ReComponent } from "@Purper";
let AppBar = class AppBar extends Component {
    async postLoad(holder) {
        this.addEventListener("", () => {
            console.log("AppBar hovered");
        });
    }
};
AppBar = __decorate([
    ReComponent("./src/components/AppBar.html", "./src/components/AppBar.html.css", "./src/components/AppBar.html.ts", AccessType.BOTH, "app-bar")
], AppBar);
export default AppBar;
//# sourceMappingURL=AppBar.html.js.map