import { IElementHolder, Page } from "@Purper";
export default class TestingActualPage extends Page {
    private params;
    private questions;
    constructor(params?: string);
    protected preInit(): Promise<void>;
    protected preLoad(holder: IElementHolder): Promise<void>;
    private handleClick;
}
//# sourceMappingURL=TestingActualPage.html.d.ts.map