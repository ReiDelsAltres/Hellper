import { Component, TemplateHolder, Attribute } from "@Purper";
import ReButton from "./ReButton.html.js";
export default class ReButtonGroup extends Component {
    private container?;
    buttonMap: Map<ReButton, boolean>;
    readonly Orientation: Attribute<"horizontal" | "vertical" | "flex">;
    readonly Variant: Attribute<"filled" | "outlined" | "text" | null>;
    readonly Color: Attribute<string>;
    readonly Size: Attribute<string>;
    readonly Selection: Attribute<"single" | "multiple" | "none">;
    readonly Value: Attribute<string | null>;
    readonly Disabled: Attribute<boolean>;
    readonly FullWidth: Attribute<boolean>;
    readonly Mini: Attribute<boolean>;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    private update;
    private collectButtons;
    private handleButtonClick;
    private updateGroup;
    private initButtonMap;
    getValueSeparated(): string[];
}
//# sourceMappingURL=ReButtonGroup.html.d.ts.map