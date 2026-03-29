var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent } from "@Purper";
let ReTypography = class ReTypography extends Component {
    static get observedAttributes() {
        return ["variant", "weight", "color", "uppercase", "truncate"];
    }
};
ReTypography = __decorate([
    ReComponent({
        markupURL: "./src/components/ReTypography.html",
        cssURL: "./src/components/ReTypography.html.css",
        jsURL: "./src/components/ReTypography.html.ts",
    }, "re-typography")
], ReTypography);
export default ReTypography;
//# sourceMappingURL=ReTypography.html.js.map