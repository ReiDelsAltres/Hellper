import { IElementHolder, Component, ReComponent, AccessType, TemplateHolder, Attribute } from "@Purper";

@ReComponent({
  markupURL: "./src/components/ReTypography.html",
  cssURL: "./src/components/ReTypography.html.css",
  jsURL: "./src/components/ReTypography.html.ts",
},"re-typography")
export default class ReTypography extends Component {
  static get observedAttributes() {
    return ["variant", "weight", "color", "uppercase", "truncate"];
  }

}
type TextVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "body1" | "body2" | "caption" | "overline";
