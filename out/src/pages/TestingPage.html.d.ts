import { Page } from "@Purper";
import { Semestr, Subject } from "../frac/Testing.js";
export default class TestingPage extends Page {
    semestrs: Semestr[];
    protected preInit(): Promise<void>;
    goToSubject(subject: Subject): void;
}
export { Semestr, Subject };
//# sourceMappingURL=TestingPage.html.d.ts.map