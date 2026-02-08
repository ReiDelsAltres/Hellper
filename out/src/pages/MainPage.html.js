var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Page, RePage } from "@Purper";
let MainPage = class MainPage extends Page {
};
MainPage = __decorate([
    RePage({
        markupURL: "./src/pages/MainPage.html",
        cssURL: "./src/pages/MainPage.html.css",
        jsURL: "./src/pages/MainPage.html.ts",
    }, "/")
], MainPage);
export default MainPage;
//# sourceMappingURL=MainPage.html.js.map