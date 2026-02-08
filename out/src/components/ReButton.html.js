var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReComponent, Attribute, Observable } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
let ReButton = class ReButton extends ComponentCore {
    slottedContainer;
    Variant = new Attribute(this, 'variant', 'filled');
    Icon = new Attribute(this, 'icon', null);
    IconAnimation = new Attribute(this, 'icon-animation', 'none');
    Href = new Attribute(this, 'href', null);
    OptionalValue = new Attribute(this, 'value', null);
    hideTextFlag = new Observable("hidden");
    iconContrastFlag = this.Variant.createDependent(val => val === 'filled');
    async preLoad(holder) {
        this.hideTextFlag.setObject(!this.textContent.trim() ? "hidden" : "");
        this.slottedContainer.addEventListener('slotchange', () => {
            this.hideTextFlag.setObject(!this.textContent.trim() ? "hidden" : "");
        });
    }
};
ReButton = __decorate([
    ReComponent({
        markupURL: "./src/components/ReButton.hmle",
        cssURL: "../../out/src/components/ReButton.html.css",
        jsURL: "./src/components/ReButton.html.js",
    }, "re-button")
], ReButton);
export default ReButton;
//# sourceMappingURL=ReButton.html.js.map