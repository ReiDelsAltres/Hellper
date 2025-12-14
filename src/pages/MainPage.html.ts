import { AccessType, Page, RePage } from "@Purper";

@RePage({
    markupURL: "./src/pages/MainPage.html",
    cssURL: "./src/pages/MainPage.html.css",
    jsURL: "./src/pages/MainPage.html.ts",
    class: MainPage,
},"/")
export default class MainPage extends Page {
    
}
