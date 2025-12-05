var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent, AccessType } from "@Purper";
let ReTypography = class ReTypography extends Component {
    static get observedAttributes() {
        return ["variant", "weight", "color", "align", "uppercase", "truncate"];
    }
    preLoad(holder) {
        this.onAttributeChangedCallback(() => this.updateTypography());
        this.updateTypography();
        return Promise.resolve();
    }
    updateTypography() {
        const textEl = this.shadowRoot?.querySelector(".typo-text") ?? this.querySelector(".typo-text");
        if (!textEl)
            return;
        // text alignment handled via CSS attribute selectors
        const isUpper = this.hasAttribute("uppercase");
        const isTruncate = this.hasAttribute("truncate");
        textEl.toggleAttribute("data-upper", isUpper);
        textEl.toggleAttribute("data-truncate", isTruncate);
    }
};
ReTypography = __decorate([
    ReComponent("./src/components/ReTypography.html", "./src/components/ReTypography.html.css", "./src/components/ReTypography.html.ts", AccessType.BOTH, "re-typography")
], ReTypography);
export default ReTypography;
//# sourceMappingURL=ReTypography.html.js.map