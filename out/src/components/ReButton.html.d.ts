import { TemplateHolder, Attribute } from "@Purper";
import { IconAnimation } from "./ReIcon.html.js";
import ComponentCore from "./core/ComponentCore.js";
export default class ReButton extends ComponentCore {
    private slottedContainer?;
    Variant: Attribute<'filled' | 'outlined' | 'text'>;
    Icon: Attribute<string | null>;
    IconAnimation: Attribute<IconAnimation>;
    Href: Attribute<string | null>;
    OptionalValue: Attribute<string | null>;
    private hideTextFlag;
    private hideIconFlag;
    private useIconContrast;
    private slotChangeHandler;
    private hasSlotContent;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    onDisconnected(): void;
}
//# sourceMappingURL=ReButton.html.d.ts.map