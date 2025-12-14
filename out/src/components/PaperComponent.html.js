var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent } from "@Purper";
let Paper = class Paper extends Component {
    static observedAttributes = ["hover", "color", "simple"];
};
Paper = __decorate([
    ReComponent({
        markupURL: "./src/components/PaperComponent.html",
        cssURL: "./src/components/PaperComponent.html.css",
        ltCssURL: "./src/components/PaperComponent.html.lt.css",
        jsURL: "./src/components/PaperComponent.html.js",
        class: Paper,
    }, "paper-component")
], Paper);
export default Paper;
//# sourceMappingURL=PaperComponent.html.js.map