var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReComponent, Attribute, Observable } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
let ReTextArea = class ReTextArea extends ComponentCore {
    textarea;
    Variant = new Attribute(this, 'variant', 'outlined');
    Placeholder = new Attribute(this, "placeholder", "");
    Value = new Attribute(this, "value", "");
    Required = new Attribute(this, 'required', false);
    isValid = new Observable(true);
    validationMessage = new Observable("");
    hideValidationMessage = new Observable(true);
    textareaInputHandler = (e) => {
        const target = e.target;
        this.Value.setObject(target.value);
    };
    async preLoad(holder) {
        this.Disabled.subscribe((key, old, isDisabled) => {
            if (isDisabled) {
                this.textarea?.setAttribute('disabled', '');
            }
            else {
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
    onDisconnected() {
        this.textarea?.removeEventListener('input', this.textareaInputHandler);
    }
    clear() {
        this.Value.setObject('');
        if (this.textarea)
            this.textarea.value = '';
    }
    checkValidity() {
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
};
ReTextArea = __decorate([
    ReComponent({
        markupURL: "./src/components/ReTextArea.hmle",
        cssURL: "./out/src/components/ReTextArea.html.css",
        jsURL: "./src/components/ReTextArea.html.ts",
    }, "re-textarea")
], ReTextArea);
export default ReTextArea;
//# sourceMappingURL=ReTextArea.html.js.map