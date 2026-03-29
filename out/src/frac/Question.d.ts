export declare class Semestr {
    number: string;
    subjects: Subject[];
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
//# sourceMappingURL=Question.d.ts.map