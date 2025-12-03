import { IElementHolder, Page } from "@Purper";
export default class DynamicPage extends Page {
    private id?;
    private id2?;
    constructor(hash?: string);
    protected preLoad(holder: IElementHolder): Promise<void>;
}
//# sourceMappingURL=DynamicPage.html.d.ts.map