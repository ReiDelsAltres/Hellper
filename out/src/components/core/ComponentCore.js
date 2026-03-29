import { Attribute, Component } from "@Purper";
export default class ComponentCore extends Component {
    Hidden = new Attribute(this, "hidden", false);
    Disabled = new Attribute(this, "disabled", false);
    Mini = new Attribute(this, "mini", false);
    Size = new Attribute(this, "size", "medium");
    Color = new Attribute(this, "color", "inherit");
}
//# sourceMappingURL=ComponentCore.js.map