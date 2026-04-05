import { Page } from "@Purper";
import { Semestr, Subject } from "../frac/Testing.js";
export default class ColloquimTestingPage extends Page {
    get Debug(): boolean;
    sections: Semestr[];
    private cacheIndicator?;
    private dataUrl;
    protected preInit(): Promise<void>;
    protected postLoad(): Promise<void>;
    private updateCacheIndicator;
    goToSubject(subject: Subject): void;
}
//# sourceMappingURL=ColloquimTestingPage.html.d.ts.map