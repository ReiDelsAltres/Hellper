import { AccessType, Page, RePage } from "@Purper"
import { TestingQuestion } from "../frac/Testing.js"

@RePage({
    markupURL: "./src/pages/TestingAllPage.hmle",
    cssURL: "./src/pages/TestingAllPage.html.css",
    jsURL: "./src/pages/TestingAllPage.html.ts"
}, "/testing/all")
export default class TestingAllPage extends Page {
    private questions: TestingQuestion[] = [];
}