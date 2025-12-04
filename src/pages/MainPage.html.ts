import { AccessType, Page, RePage } from "@Purper";

@RePage(
    "./src/pages/MainPage.html",
    "./src/pages/MainPage.html.css",
    "./src/pages/MainPage.html.ts",
    AccessType.BOTH,
    "/"
)
export default class MainPage extends Page {
    
}
