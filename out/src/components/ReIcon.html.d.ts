import { TemplateHolder, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
type IconVariant = "block" | 'filled' | 'outlined' | 'rounded' | 'sharp';
type IconWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700;
export type IconAnimation = 'none' | 'spin' | 'pulse' | 'bounce' | 'shake';
export default class ReIcon extends ComponentCore {
    private iconSpan?;
    Icon: Attribute<string | null>;
    Variant: Attribute<IconVariant>;
    Weight: Attribute<IconWeight>;
    OpticalSize: Attribute<IntRange<20, 49>>;
    Animation: Attribute<IconAnimation>;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    private updateIcon;
}
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>;
type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
export {};
//# sourceMappingURL=ReIcon.html.d.ts.map