import { Component, ReComponent, TemplateHolder, Attribute, Observable } from "@Purper";

@ReComponent({
    markupURL: "./src/components/ReInput.hmle",
    cssURL: "./src/components/ReInput.html.css",
    jsURL: "./src/components/ReInput.html.ts",
}, "re-input")
export default class ReInput extends Component {
    private icon?: HTMLSpanElement;
    private input?: HTMLInputElement;

    // Attributes
    public readonly Color: Attribute<string> = new Attribute(this, 'color', 'primary');
    public readonly Variant: Attribute<'filled' | 'outlined' | 'text'> = new Attribute(this, 'variant', 'filled');

    public readonly Placeholder: Attribute<string> = new Attribute<string>(this, "placeholder", "");
    public readonly Value: Attribute<string> = new Attribute<string>(this, "value", "");
    public readonly Min: Attribute<number> = new Attribute<number>(this, "min", 0);
    public readonly Max: Attribute<number> = new Attribute<number>(this, "max", 9999);
    
    public readonly Type: Attribute<'text' | 'number' | 'email' | 'password'> = new Attribute(this, "type", "text");

    public readonly Disabled: Attribute<boolean> = new Attribute(this, 'disabled', false);
    public readonly Required: Attribute<boolean> = new Attribute(this, 'required', false);

    // Observable flags for template
    private isValid: Observable<boolean> = new Observable(true);
    private validationMessage: Observable<string> = new Observable("");
    private hideValidationMessage: Observable<boolean> = new Observable(true);
    private iconName: Observable<string | null> = new Observable(null);

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        this.Disabled.subscribe((key, old, isDisabled) => {
            if (isDisabled) {
                this.input?.setAttribute('disabled', '');
            } else {
                this.input?.removeAttribute('disabled');
            }
        });
        this.Value.subscribe((key, old, val) => {
            this.input.value = val;
            this.validate();
        });
        // Sync input events to Value attribute
        this.input?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.Value.setObject(target.value);
        });

        this.input?.addEventListener('blur', () => {
            this.validate();
        });

        this.Min.subscribe(() => this.validate());
        this.Max.subscribe(() => this.validate());

        // Initial validation
        this.validate();
    }

    private validate(): void {
        const value = this.Value.value;
        const min = this.Min.value as number;
        const max = this.Max.value as number;
        const type = this.Type.value;

        let valid = true;
        let message = "";

        // Required validation
        if (this.Required.value && !value?.trim()) {
            valid = false;
            message = "This field is required";
        }
        // Number validation with Min/Max
        else if (type === 'number' && value) {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                valid = false;
                message = "Please enter a valid number";
            } else if (min !== null && numValue < min) {
                valid = false;
                message = `Value must be at least ${min}`;
            } else if (max !== null && numValue > max) {
                valid = false;
                message = `Value must be at most ${max}`;
            }
        }
        // Text length validation with Min/Max
        else if (type === 'text' && value) {
            if (min !== null && value.length < min) {
                valid = false;
                message = `Minimum ${min} characters required`;
            } else if (max !== null && value.length > max) {
                valid = false;
                message = `Maximum ${max} characters allowed`;
            }
        }

        this.isValid.setObject(valid);
        this.validationMessage.setObject(message);
        this.hideValidationMessage.setObject(valid);

        // Update validation attribute for CSS styling
        if (valid) {
            this.removeAttribute('invalid');
        } else {
            this.setAttribute('invalid', '');
        }
    }

    public checkValidity(): boolean {
        this.validate();
        return this.isValid.getObject();
    }

    public getValidationMessage(): string {
        return this.validationMessage.getObject();
    }
}
