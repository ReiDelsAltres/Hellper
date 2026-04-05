var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Fetcher, ModuleManager, Page, RePage, Router } from "@Purper";
let ColloquimTestingPage = class ColloquimTestingPage extends Page {
    get Debug() { return ModuleManager.isActive("Debug"); }
    sections = [];
    cacheIndicator;
    dataUrl = './resources/data/colloquim_testing.json';
    async preInit() {
        this.sections = (await Fetcher.fetchJSON(this.dataUrl)).reverse();
    }
    async postLoad() {
        if (this.cacheIndicator)
            this.updateCacheIndicator(this.dataUrl, this.sections);
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
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/colloquim/sub?subject=' + params)), true);
    }
};
ColloquimTestingPage = __decorate([
    RePage({
        markupURL: "./src/pages/ColloquimTestingPage.hmle",
        cssURL: "./src/pages/ColloquimTestingPage.html.css",
    }, "/colloquim")
], ColloquimTestingPage);
export default ColloquimTestingPage;
//# sourceMappingURL=ColloquimTestingPage.html.js.map