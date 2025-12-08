import { IElementHolder, Page } from "@Purper";
export default class TestingActualPage extends Page {
    private params;
    private questions;
    private statuses;
    constructor(params?: string);
    protected preInit(): Promise<void>;
    protected postLoad(holder: IElementHolder): Promise<void>;
    private resolveEnding;
    private closeResult;
    private handleClick;
    private regenerateShuffle;
}
//# sourceMappingURL=TestingActualPage.html.d.ts.map