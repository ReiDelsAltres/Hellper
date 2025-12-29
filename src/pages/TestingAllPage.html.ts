import { AccessType, Page, RePage } from "@Purper"
import { Question } from "tri/QuestionParser"

@RePage({
    markupURL: "./src/pages/TestingAllPage.hmle",
    cssURL: "./src/pages/TestingAllPage.html.css",
    jsURL: "./src/pages/TestingAllPage.html.ts"
}, "/testing/all")
export default class TestingAllPage extends Page {
    private questions: Question[] = [];
}