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
export interface TestingFile<T extends TestingQuestion = TestingQuestion> {
    UseIndex: boolean;
    Questions: T[];
}
export interface ColloquiumFile extends TestingFile<ColloquiumQuestion> {
    Bilets?: ColloquiumBilet[];
}
export interface ExamFile extends TestingFile<ExamQuestion> {
    Questions: ExamQuestion[];
}
export interface TestingQuestion {
    Id: number;
    Title: string;
    Answers: string[];
}
export interface ExamQuestion extends TestingQuestion {
    RId?: number;
}
export interface ColloquiumQuestion extends TestingQuestion {
    Keywords?: string[];
    size?: string;
}
export interface ColloquiumBilet {
    Id: number;
    Title?: string;
    QuestionIds: number[];
}
//# sourceMappingURL=Testing.d.ts.map