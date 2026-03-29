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
    /*private content?: HTMLSpanElement;
    private icon?: ReIcon;*/

    public Variant: Attribute<'filled' | 'outlined' | 'text'> = new Attribute(this, 'variant', 'filled');
    public Icon: Attribute<string | null> = new Attribute(this, 'icon', null);
    public IconAnimation: Attribute<IconAnimation> = new Attribute(this, 'icon-animation', 'none');
    public Href: Attribute<string | null> = new Attribute(this, 'href', null);

    public OptionalValue: Attribute<string | null> = new Attribute(this, 'value', null);

    private hideTextFlag: Observable<boolean> = new Observable(null);
    private hideIconFlag: Observable<boolean> = this.Icon.createDependent(val => val === null ? true : null);
    private useIconContrast: Observable<boolean> = this.Variant.createDependent(val => val === 'filled' ? true : null);

    private slotChangeHandler = () => {
        this.hideTextFlag.setObject(this.hasSlotContent() ? null : true);
    };

    private hasSlotContent(): boolean {
        return (this.slottedContainer?.assignedNodes() ?? []).some(n =>
            n.nodeType === Node.ELEMENT_NODE ||
            (n.nodeType === Node.TEXT_NODE && n.textContent!.trim() !== "")
        );
    }

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        this.hideTextFlag.setObject(this.textContent.trim() !== "" ? null : true);

        this.slottedContainer.addEventListener('slotchange', this.slotChangeHandler);
    }

    public onDisconnected(): void {
        this.slottedContainer?.removeEventListener('slotchange', this.slotChangeHandler);
    }
}
