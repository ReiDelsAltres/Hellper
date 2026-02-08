var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReComponent, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
let ReChip = class ReChip extends ComponentCore {
    Icon = new Attribute(this, "icon", null);
    Variant = new Attribute(this, "variant", "filled");
    isIconAbsent = this.Icon.createDependent(value => value === null || value === '');
    shouldBeContrast = this.Variant.createDependent(value => value === 'filled');
};
ReChip = __decorate([
    ReComponent({
        markupURL: "./src/components/ReChip.hmle",
        cssURL: "../../out/src/components/ReChip.html.css",
        jsURL: "./src/components/ReChip.html.js",
    }, "re-chip")
], ReChip);
export default ReChip;
//# sourceMappingURL=ReChip.html.js.map