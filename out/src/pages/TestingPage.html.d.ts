import { IElementHolder, Page } from "@Purper";
export default class TestingPage extends Page {
    semestrs: Semestr[];
    protected preInit(): Promise<void>;
    protected preLoad(holder: IElementHolder): Promise<void>;
}
declare class Semestr {
    private number;
    private subjects;
    constructor(number: string, subjects: Subject[]);
}
export declare class Subject {
    name: string;
    translatedName?: string;
    teacher: string;
    file: string;
    groups: string[];
    constructor(name: string, teacher: string, groups: string[], translatedName?: string, file?: string);
}
export {};
//# sourceMappingURL=TestingPage.html.d.ts.map