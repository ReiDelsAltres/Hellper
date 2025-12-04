import { IElementHolder, Component, ReComponent, AccessType } from "@Purper";

@ReComponent(
    "./src/components/ColorPalettePreview.phtml",
    "./src/components/ColorPalettePreview.html.css",
    "./src/components/ColorPalettePreview.html.ts",
    AccessType.BOTH,
    "color-palette"
)
export default class ColorPalettePreview extends Component {
    static get observedAttributes() {
        return [
            "theme"
        ];
    }

    onConnected(): void {
        requestAnimationFrame(() => this.updatePalette());
    }

    onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void {
        if (oldValue !== newValue) {
            this.updatePalette();
        }
    }

    private updatePalette(): void {
        const root = this.shadowRoot ?? this;
        const nameEl = root.querySelector<HTMLElement>(".palette-name");
        
        // Extract theme name from class list (e.g., "blazor-theme" → "Blazor")
        const themeClass = Array.from(this.classList).find(c => c.endsWith("-theme"));
        if (nameEl && themeClass) {
            const themeName = themeClass.replace("-theme", "");
            nameEl.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
        }

        // Update color blocks with computed values
        const styles = getComputedStyle(this);
        const blocks = root.querySelectorAll<HTMLElement>(".color-block");

        blocks.forEach((block) => {
            const varName = block.dataset.var;
            if (!varName) return;

            const value = styles.getPropertyValue(varName).trim();
            if (value) {
                block.style.background = value;
            }
        });
    }
}