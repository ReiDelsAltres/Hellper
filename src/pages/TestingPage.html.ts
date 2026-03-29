import { AccessType, Fetcher, IElementHolder, Page, RePage, Router } from "@Purper";
import { Semestr, Subject } from "../frac/Testing.js";


@RePage({
  markupURL: "./src/pages/TestingPage.hmle",
  cssURL: "./src/pages/TestingPage.html.css",
  jsURL: "./src/pages/TestingPage.html.ts",
}, "/testing")
export default class TestingPage extends Page {
  public semestrs: Semestr[] = [];

  protected async preInit(): Promise<void> {
    this.semestrs = (await Fetcher.fetchJSON('./resources/data/testing.json') as Semestr[]).reverse();
  }

  public goToSubject(subject: Subject): void {
    const params = encodeURIComponent(JSON.stringify(subject));
    Router.tryRouteTo(new URL(Fetcher.resolveUrl('/testing/sub?subject=' + params)), true);
  }
}

export { Semestr, Subject };
