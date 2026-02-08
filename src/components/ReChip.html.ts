import { IElementHolder, Component, ReComponent, TemplateHolder, Attribute, Observable } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";

type ChipVariant = "filled" | "outlined"

@ReComponent({
  markupURL: "./src/components/ReChip.hmle",
  cssURL: "../../out/src/components/ReChip.html.css",
  jsURL: "./src/components/ReChip.html.js",
}, "re-chip")
export default class ReChip extends ComponentCore {
  public Icon: Attribute<string | null> = new Attribute<string | null>(this, "icon", null);

  public Variant: Attribute<ChipVariant> = new Attribute<ChipVariant>(this, "variant", "filled");

  private isIconAbsent: Observable<boolean> = this.Icon.createDependent(value => value === null || value === '');
  private shouldBeContrast: Observable<boolean> = this.Variant.createDependent(value => value === 'filled');
}
