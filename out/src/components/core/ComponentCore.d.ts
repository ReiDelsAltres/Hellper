import { Attribute, Component } from "@Purper";
export type DesignColor = "primary" | "secondary" | "tertiary" | "additional";
export type TechnicalColor = "empty" | "info" | "warning" | "success" | "error";
export type DesignColorAlias = "pri" | "sec" | "ter" | "add";
export type TechnicalColorAlias = "emp" | "inf" | "warn" | "succ" | "err";
export type ColorAlias = DesignColorAlias | TechnicalColorAlias;
export type Color = DesignColor | TechnicalColor;
export type ComponentColor = Color | ColorAlias | "inherit";
export type BasicComponentSize = "small" | "medium" | "large";
export type BasicComponentSizeAlias = "sm" | "md" | "lg";
export type ExtendedComponentSize = BasicComponentSize | "extra-small" | "extra-large";
export type ExtendedComponentSizeAlias = BasicComponentSizeAlias | "xs" | "xl";
export type ComponentSize = ExtendedComponentSize | ExtendedComponentSizeAlias;
export default abstract class ComponentCore extends Component {
    Hidden: Attribute<boolean>;
    Disabled: Attribute<boolean>;
    Mini: Attribute<boolean>;
    Size: Attribute<ComponentSize>;
    Color: Attribute<ComponentColor>;
}
//# sourceMappingURL=ComponentCore.d.ts.map