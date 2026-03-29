var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReComponent, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
let ReIcon = class ReIcon extends ComponentCore {
    iconSpan;
    Icon = new Attribute(this, "icon", null);
    Variant = new Attribute(this, "variant", "filled");
    Weight = new Attribute(this, "weight", 400);
    OpticalSize = new Attribute(this, "optical-size", 48);
    Animation = new Attribute(this, "animation", "none");
    preLoad(holder) {
        this.updateIcon();
        this.Icon.subscribe(() => this.updateIcon());
        return Promise.resolve();
    }
    updateIcon() {
        if (!this.iconSpan)
            return;
        this.iconSpan.textContent = this.Icon.value ?? '';
        this.iconSpan.style.fontVariationSettings =
            `'FILL' ${this.Variant.value === 'filled' ? 1 : 0}, 
            'wght' ${this.Weight.value}, 
            'GRAD' 0, 
            'opsz' ${this.OpticalSize.value}`;
    }
};
ReIcon = __decorate([
    ReComponent({
        markupURL: "./src/components/ReIcon.hmle",
        cssURL: "../../out/src/components/ReIcon.html.css",
        jsURL: "./src/components/ReIcon.html.js",
    }, "re-icon")
], ReIcon);
export default ReIcon;
//# sourceMappingURL=ReIcon.html.js.map