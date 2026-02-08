import { Component, TemplateHolder, Attribute } from "@Purper";
export default class ReInput extends Component {
    private icon?;
    private input?;
    readonly Color: Attribute<string>;
    readonly Variant: Attribute<'filled' | 'outlined' | 'text'>;
    readonly Placeholder: Attribute<string>;
    readonly Value: Attribute<string>;
    readonly Min: Attribute<number>;
    readonly Max: Attribute<number>;
    readonly Type: Attribute<'text' | 'number' | 'email' | 'password'>;
    readonly Disabled: Attribute<boolean>;
    readonly Required: Attribute<boolean>;
    private isValid;
    private validationMessage;
    private hideValidationMessage;
    private iconName;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    private validate;
    checkValidity(): boolean;
    getValidationMessage(): string;
}
//# sourceMappingURL=ReInput.html.d.ts.map