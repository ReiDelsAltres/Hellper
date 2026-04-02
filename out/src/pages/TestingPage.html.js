var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Fetcher, Page, RePage, Router } from "@Purper";
import { Semestr, Subject } from "../frac/Testing.js";
let TestingPage = class TestingPage extends Page {
    semestrs = [];
    cacheIndicator;
    dataUrl = './resources/data/testing.json';
    async preInit() {
        this.semestrs = (await Fetcher.fetchJSON(this.dataUrl)).reverse();
    }
    async postLoad() {
        this.updateCacheIndicator(this.dataUrl, this.semestrs);
    }
    updateCacheIndicator(url, data) {
        if (!this.cacheIndicator)
            return;
        this.cacheIndicator.loaded.setObject(true);
        this.cacheIndicator.fileName.setObject(url);
        const jsonStr = JSON.stringify(data);
        const sizeBytes = new Blob([jsonStr]).size;
        this.cacheIndicator.fileSize.setObject(sizeBytes);
        const resolvedUrl = Fetcher.resolveUrl(url);
        const entries = performance.getEntriesByName(resolvedUrl, 'resource');
        const entry = entries.length > 0 ? entries[entries.length - 1] : null;
        if (entry) {
            if (entry.transferSize === 0) {
                this.cacheIndicator.source.setObject('cache');
                this.cacheIndicator.networkCost.setObject(0);
            }
            else {
                this.cacheIndicator.source.setObject('network');
                this.cacheIndicator.networkCost.setObject(entry.transferSize);
            }
        }
        else {
            this.cacheIndicator.source.setObject('unknown');
        }
    }
    goToSubject(subject) {
        const params = encodeURIComponent(JSON.stringify(subject));
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/testing/sub?subject=' + params)), true);
    }
};
TestingPage = __decorate([
    RePage({
        markupURL: "./src/pages/TestingPage.hmle",
        cssURL: "./src/pages/TestingPage.html.css",
    }, "/testing")
], TestingPage);
export default TestingPage;
export { Semestr, Subject };
//# sourceMappingURL=TestingPage.html.js.map