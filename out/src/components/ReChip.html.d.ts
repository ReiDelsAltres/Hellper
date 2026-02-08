import { Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
type ChipVariant = "filled" | "outlined";
export default class ReChip extends ComponentCore {
    Icon: Attribute<string | null>;
    Variant: Attribute<ChipVariant>;
    private isIconAbsent;
    private shouldBeContrast;
}
export {};
//# sourceMappingURL=ReChip.html.d.ts.map