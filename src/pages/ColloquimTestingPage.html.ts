import { Fetcher, ModuleManager, Page, RePage, Router } from "@Purper";
import { Semestr, Subject } from "../frac/Testing.js";
import CacheIndicator from "../components/CacheIndicator.html.js";

@RePage({
    markupURL: "./src/pages/ColloquimTestingPage.hmle",
    cssURL: "./src/pages/ColloquimTestingPage.html.css",
}, "/colloquim")
export default class ColloquimTestingPage extends Page {
    public get Debug(): boolean { return ModuleManager.isActive("Debug"); }
    public sections: Semestr[] = [];
    private cacheIndicator?: CacheIndicator;
    private dataUrl = './resources/data/colloquim_testing.json';

    protected async preInit(): Promise<void> {
        this.sections = (await Fetcher.fetchJSON(this.dataUrl) as Semestr[]).reverse();
    }

    protected async postLoad(): Promise<void> {
        if (this.cacheIndicator) this.updateCacheIndicator(this.dataUrl, this.sections);
    }

    private updateCacheIndicator(url: string, data: any): void {
        if (!this.cacheIndicator) return;

        this.cacheIndicator.loaded.setObject(true);
        this.cacheIndicator.fileName.setObject(url);

        const jsonStr = JSON.stringify(data);
        const sizeBytes = new Blob([jsonStr]).size;
        this.cacheIndicator.fileSize.setObject(sizeBytes);

        const resolvedUrl = Fetcher.resolveUrl(url);
        const entries = performance.getEntriesByName(resolvedUrl, 'resource') as PerformanceResourceTiming[];
        const entry = entries.length > 0 ? entries[entries.length - 1] : null;

        if (entry) {
            if (entry.transferSize === 0) {
                this.cacheIndicator.source.setObject('cache');
                this.cacheIndicator.networkCost.setObject(0);
            } else {
                this.cacheIndicator.source.setObject('network');
                this.cacheIndicator.networkCost.setObject(entry.transferSize);
            }
        } else {
            this.cacheIndicator.source.setObject('unknown');
        }
    }

    public goToSubject(subject: Subject): void {
        const params = encodeURIComponent(JSON.stringify(subject));
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/colloquim/sub?subject=' + params)), true);
    }
}
