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
    public Hidden: Attribute<boolean> = new Attribute<boolean>(this, "hidden", false);
    public Disabled: Attribute<boolean> = new Attribute<boolean>(this, "disabled", false);
    public Mini: Attribute<boolean> = new Attribute<boolean>(this, "mini", false);

    public Size: Attribute<ComponentSize> = new Attribute<ComponentSize>(this, "size", "medium");

    public Color: Attribute<ComponentColor> = new Attribute<ComponentColor>(this, "color", "inherit");
}
