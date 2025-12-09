import { IElementHolder, Page } from "@Purper";
export default class TestingPage extends Page {
    private semestrs;
    protected preInit(): Promise<void>;
    protected preLoad(holder: IElementHolder): Promise<void>;
}
export declare class Subject {
    name: string;
    translatedName?: string;
    teacher: string;
    file: string;
    groups: string[];
    constructor(name: string, teacher: string, groups: string[], translatedName?: string, file?: string);
}
//# sourceMappingURL=TestingPage.html.d.ts.map