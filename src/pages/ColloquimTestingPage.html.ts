import { Fetcher, Page, RePage, Router } from "@Purper";
import { Semestr, Subject } from "../frac/Testing.js";

@RePage({
    markupURL: "./src/pages/ColloquimTestingPage.hmle",
    cssURL: "./src/pages/ColloquimTestingPage.html.css",
    jsURL: "./src/pages/ColloquimTestingPage.html.ts",
}, "/colloquim")
export default class ColloquimTestingPage extends Page {
    public sections: Semestr[] = [];

    protected async preInit(): Promise<void> {
        this.sections = (await Fetcher.fetchJSON('./resources/data/colloquim_testing.json') as Semestr[]).reverse();
    }

    public goToSubject(subject: Subject): void {
        const params = encodeURIComponent(JSON.stringify(subject));
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/colloquim/sub?subject=' + params)), true);
    }
}
