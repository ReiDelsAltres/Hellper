import { Page } from "@Purper";
export default class DynamicPage extends Page {
    id;
    id2;
    constructor(hash) {
        super();
        const params = new URLSearchParams(hash);
        this.id = params.get("id");
        this.id2 = params.get("id2");
    }
    preLoad(holder) {
        holder.element.querySelector('#id1').textContent = this.id ?? 'null';
        holder.element.querySelector('#id2').textContent = this.id2 ?? 'null';
        return Promise.resolve();
    }
}
//# sourceMappingURL=DynamicPage.html.js.map