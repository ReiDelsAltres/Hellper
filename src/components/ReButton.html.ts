import { IElementHolder, Component, ReComponent, TemplateHolder, Attribute, Observable } from "@Purper";
import ReIcon, { IconAnimation } from "./ReIcon.html.js";
import ComponentCore from "./core/ComponentCore.js";

@ReComponent({
    markupURL: "./src/components/ReButton.hmle",
    cssURL: "../../out/src/components/ReButton.html.css",
    jsURL: "./src/components/ReButton.html.js",
}, "re-button")
export default class ReButton extends ComponentCore {
    private slottedContainer?: HTMLSlotElement;

    public Variant: Attribute<'filled' | 'outlined' | 'text'> = new Attribute(this, 'variant', 'filled');

    public Icon: Attribute<string | null> = new Attribute(this, 'icon', null);
    public IconAnimation: Attribute<IconAnimation> = new Attribute(this, 'icon-animation', 'none');

    public Href: Attribute<string | null> = new Attribute(this, 'href', null);

    public OptionalValue: Attribute<string | null> = new Attribute(this, 'value', null);

    private hideTextFlag: Observable<string> = new Observable("hidden");
    private iconContrastFlag: Observable<boolean> = this.Variant.createDependent(val => val === 'filled');

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        this.hideTextFlag.setObject(!this.textContent.trim() ? "hidden" : "");

        this.slottedContainer.addEventListener('slotchange', () => {
            this.hideTextFlag.setObject(!this.textContent.trim() ? "hidden" : "");
        });
    }
}
