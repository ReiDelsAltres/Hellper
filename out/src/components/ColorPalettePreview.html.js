var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent } from "@Purper";
let ColorPalettePreview = class ColorPalettePreview extends Component {
    static get observedAttributes() {
        return [
            "theme"
        ];
    }
    onConnected() {
        requestAnimationFrame(() => this.updatePalette());
    }
    onAttributeChanged(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updatePalette();
        }
    }
    updatePalette() {
        const root = this.shadowRoot ?? this;
        const nameEl = root.querySelector(".palette-name");
        // Extract theme name from class list (e.g., "blazor-theme" → "Blazor")
        const themeClass = Array.from(this.classList).find(c => c.endsWith("-theme"));
        if (nameEl && themeClass) {
            const themeName = themeClass.replace("-theme", "");
            nameEl.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
        }
        // Update color blocks with computed values
        const styles = getComputedStyle(this);
        const blocks = root.querySelectorAll(".color-block");
        blocks.forEach((block) => {
            const varName = block.dataset.var;
            if (!varName)
                return;
            const value = styles.getPropertyValue(varName).trim();
            if (value) {
                block.style.background = value;
            }
        });
    }
};
ColorPalettePreview = __decorate([
    ReComponent({
        markupURL: "./src/components/ColorPalettePreview.html",
        cssURL: "./src/components/ColorPalettePreview.html.css",
        jsURL: "./src/components/ColorPalettePreview.html.js",
        class: ColorPalettePreview,
    }, "color-palette")
], ColorPalettePreview);
export default ColorPalettePreview;
//# sourceMappingURL=ColorPalettePreview.html.js.map