import { AccessType, Page, RePage } from "@Purper"

@RePage({
    markupURL: "./src/pages/TestingAllPage.hmle",
    cssURL: "./src/pages/TestingAllPage.html.css",
    jsURL: "./src/pages/TestingAllPage.html.ts",
    class: TestingAllPage,
}, "/testing/all")
export default class TestingAllPage extends Page {
    private questions;
    
}