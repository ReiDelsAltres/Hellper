import { ReComponent, TemplateHolder, Attribute, Observable } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";

@ReComponent({
    markupURL: "./src/components/ReTextArea.hmle",
    cssURL: "../../out/src/components/ReTextArea.html.css",
    jsURL: "./src/components/ReTextArea.html.ts",
}, "re-textarea")
export default class ReTextArea extends ComponentCore {
    private textarea?: HTMLTextAreaElement;

    public readonly Variant: Attribute<'filled' | 'outlined'> = new Attribute(this, 'variant', 'outlined');
    public readonly Placeholder: Attribute<string> = new Attribute<string>(this, "placeholder", "");
    public readonly Value: Attribute<string> = new Attribute<string>(this, "value", "");
    public readonly Required: Attribute<boolean> = new Attribute(this, 'required', false);

    private isValid: Observable<boolean> = new Observable(true);
    private validationMessage: Observable<string> = new Observable("");
    private hideValidationMessage: Observable<boolean> = new Observable(true);

    private textareaInputHandler = (e: Event) => {
        const target = e.target as HTMLTextAreaElement;
        this.Value.setObject(target.value);
    };

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        this.Disabled.subscribe((key, old, isDisabled) => {
            if (isDisabled) {
                this.textarea?.setAttribute('disabled', '');
            } else {
                this.textarea?.removeAttribute('disabled');
            }
        });

        this.Value.subscribe((key, old, val) => {
            if (this.textarea && this.textarea.value !== val) {
                this.textarea.value = val;
            }
        });

        this.textarea?.addEventListener('input', this.textareaInputHandler);
    }

    public onDisconnected(): void {
        this.textarea?.removeEventListener('input', this.textareaInputHandler);
    }

    public clear(): void {
        this.Value.setObject('');
        if (this.textarea) this.textarea.value = '';
    }

    public checkValidity(): boolean {
        if (this.Required.value && !this.Value.value?.trim()) {
            this.isValid.setObject(false);
            this.validationMessage.setObject("This field is required");
            this.hideValidationMessage.setObject(false);
            this.setAttribute('invalid', '');
            return false;
        }
        this.isValid.setObject(true);
        this.hideValidationMessage.setObject(true);
        this.removeAttribute('invalid');
        return true;
    }
}
