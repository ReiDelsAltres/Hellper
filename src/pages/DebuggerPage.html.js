import { Page, Fetcher } from "@Purper";

export default class DebuggerPage extends Page {
    constructor() {
        super();
        this.componentRegistry = {};
    }
    async preLoad() {
        await super.preLoad();
        this.componentRegistry = await Fetcher.fetchJSON('./data/componentRegistry.json');
    }
    async postLoad(element) {
        await super.postLoad(element);
    }
}