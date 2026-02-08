var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent, Attribute, Observable } from "@Purper";
let ReInput = class ReInput extends Component {
    icon;
    input;
    // Attributes
    Color = new Attribute(this, 'color', 'primary');
    Variant = new Attribute(this, 'variant', 'filled');
    Placeholder = new Attribute(this, "placeholder", "");
    Value = new Attribute(this, "value", "");
    Min = new Attribute(this, "min", 0);
    Max = new Attribute(this, "max", 9999);
    Type = new Attribute(this, "type", "text");
    Disabled = new Attribute(this, 'disabled', false);
    Required = new Attribute(this, 'required', false);
    // Observable flags for template
    isValid = new Observable(true);
    validationMessage = new Observable("");
    hideValidationMessage = new Observable(true);
    iconName = new Observable(null);
    async preLoad(holder) {
        this.Disabled.subscribe((key, old, isDisabled) => {
            if (isDisabled) {
                this.input?.setAttribute('disabled', '');
            }
            else {
                this.input?.removeAttribute('disabled');
            }
        });
        this.Value.subscribe((key, old, val) => {
            this.input.value = val;
            this.validate();
        });
        // Sync input events to Value attribute
        this.input?.addEventListener('input', (e) => {
            const target = e.target;
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
    validate() {
        const value = this.Value.value;
        const min = this.Min.value;
        const max = this.Max.value;
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
            }
            else if (min !== null && numValue < min) {
                valid = false;
                message = `Value must be at least ${min}`;
            }
            else if (max !== null && numValue > max) {
                valid = false;
                message = `Value must be at most ${max}`;
            }
        }
        // Text length validation with Min/Max
        else if (type === 'text' && value) {
            if (min !== null && value.length < min) {
                valid = false;
                message = `Minimum ${min} characters required`;
            }
            else if (max !== null && value.length > max) {
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
        }
        else {
            this.setAttribute('invalid', '');
        }
    }
    checkValidity() {
        this.validate();
        return this.isValid.getObject();
    }
    getValidationMessage() {
        return this.validationMessage.getObject();
    }
};
ReInput = __decorate([
    ReComponent({
        markupURL: "./src/components/ReInput.hmle",
        cssURL: "./src/components/ReInput.html.css",
        jsURL: "./src/components/ReInput.html.ts",
    }, "re-input")
], ReInput);
export default ReInput;
//# sourceMappingURL=ReInput.html.js.map