import { TemplateHolder, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
export default class ReTextArea extends ComponentCore {
    private textarea?;
    readonly Variant: Attribute<'filled' | 'outlined'>;
    readonly Placeholder: Attribute<string>;
    readonly Value: Attribute<string>;
    readonly Required: Attribute<boolean>;
    private isValid;
    private validationMessage;
    private hideValidationMessage;
    private textareaInputHandler;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    onDisconnected(): void;
    clear(): void;
    checkValidity(): boolean;
}
//# sourceMappingURL=ReTextArea.html.d.ts.map