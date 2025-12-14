import { Component, ReComponent } from "@Purper";

@ReComponent({
    markupURL: "./src/components/PaperComponent.html",
    cssURL: "./src/components/PaperComponent.html.css",
    ltCssURL: "./src/components/PaperComponent.html.lt.css",
    jsURL: "./src/components/PaperComponent.html.js",
    class: Paper,
}, "paper-component")
export default class Paper extends Component {
    static observedAttributes = ["hover", "color", "simple"];
}