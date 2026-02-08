import { IElementHolder, Component, ReComponent, TemplateHolder, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";

type IconVariant = "block" | 'filled' |'outlined' | 'rounded' | 'sharp';
type IconWeight = 100|200|300|400|500|600|700;
export type IconAnimation = 'none' | 'spin' | 'pulse' | 'bounce' | 'shake';

@ReComponent({
    markupURL: "./src/components/ReIcon.hmle",
    cssURL: "../../out/src/components/ReIcon.html.css",
    jsURL: "./src/components/ReIcon.html.js",
}, "re-icon")
export default class ReIcon extends ComponentCore {
    private iconSpan?: HTMLSpanElement;

    public Icon: Attribute<string | null> = new Attribute<string | null>(this, "icon", null);
    public Variant: Attribute<IconVariant> = new Attribute(this, "variant", "filled");

    public Weight: Attribute<IconWeight> = new Attribute(this, "weight", 400);
    public OpticalSize: Attribute<IntRange<20, 49>> = new Attribute(this, "optical-size", 48);
    public Animation: Attribute<IconAnimation> = new Attribute(this, "animation", "none");

    protected preLoad(holder: TemplateHolder): Promise<void> {
        this.updateIcon();
        this.Icon.subscribe(() => this.updateIcon());
        return Promise.resolve();
    }

    private updateIcon(): void {
        if (!this.iconSpan) return;
        this.iconSpan.textContent = this.Icon.value ?? '';

        this.iconSpan.style.fontVariationSettings = 
            `'FILL' ${this.Variant.value === 'filled' ? 1 : 0}, 
            'wght' ${this.Weight.value}, 
            'GRAD' 0, 
            'opsz' ${this.OpticalSize.value}`;
    }
}

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>
