import { Page } from "@Purper";
import { Semestr, Subject } from "../frac/Testing.js";
export default class TestingPage extends Page {
    semestrs: Semestr[];
    private cacheIndicator?;
    private dataUrl;
    protected preInit(): Promise<void>;
    protected postLoad(): Promise<void>;
    private updateCacheIndicator;
    goToSubject(subject: Subject): void;
}
export { Semestr, Subject };
//# sourceMappingURL=TestingPage.html.d.ts.map