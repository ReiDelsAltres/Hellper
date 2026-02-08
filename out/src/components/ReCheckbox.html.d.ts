import { Component, Attribute, TemplateHolder } from "@Purper";
export default class ReCheckbox extends Component {
    private box?;
    private labelEl?;
    checked: Attribute<boolean>;
    indeterminate: Attribute<boolean>;
    disabled: Attribute<boolean>;
    color: Attribute<string>;
    size: Attribute<string>;
    label: Attribute<string>;
    name: Attribute<string>;
    mini: Attribute<boolean>;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    private handleClick;
}
//# sourceMappingURL=ReCheckbox.html.d.ts.map