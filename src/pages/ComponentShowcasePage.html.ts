import { IElementHolder, Page } from "@Purper";

export default class ComponentShowcasePage extends Page {
    protected preLoad(holder: IElementHolder): Promise<void> {
        // Page is static, no additional logic needed
        return Promise.resolve();
    }
}
