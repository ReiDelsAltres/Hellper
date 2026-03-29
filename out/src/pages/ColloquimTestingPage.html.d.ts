import { Page } from "@Purper";
import { Semestr, Subject } from "../frac/Testing.js";
export default class ColloquimTestingPage extends Page {
    sections: Semestr[];
    protected preInit(): Promise<void>;
    goToSubject(subject: Subject): void;
}
//# sourceMappingURL=ColloquimTestingPage.html.d.ts.map