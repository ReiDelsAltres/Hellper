import { Attribute, Component, ReComponent } from "@Purper";

@ReComponent({
    markupURL: "./src/components/PaperComponent.html",
    cssURL: "./src/components/PaperComponent.html.css",
    ltCssURL: "./src/components/PaperComponent.html.lt.css",
    jsURL: "./src/components/PaperComponent.html.js",
}, "paper-component")
export default class Paper extends Component {
    public readonly Interactive: Attribute<boolean> = new Attribute(this, "interactive", false);
    public readonly Color: Attribute<string> = new Attribute(this, "color", "primary");
    public readonly Alternate: Attribute<boolean> = new Attribute(this, "alternate", false);
}