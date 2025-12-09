import { AccessType, Page, RePage } from "@Purper"

@RePage(
    "./src/pages/TestingAllPage.hmle",
    "./src/pages/TestingAllPage.html.css",
    "./src/pages/TestingAllPage.html.ts",
    AccessType.BOTH,
    "/testing/all"
)
export default class TestingAllPage extends Page {
    
}