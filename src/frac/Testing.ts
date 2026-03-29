export class Semestr {
    public number: string;
    public subjects: Subject[];
    constructor(number: string, subjects: Subject[]) {
        this.number = number;
        this.subjects = subjects;
    }
}

export class Subject {
    public name: string;
    public translatedName?: string;
    public teacher: string;
    public file: string;
    public groups: string[];

    constructor(name: string, teacher: string, groups: string[], translatedName?: string, file?: string) {
        this.name = name;
        this.teacher = teacher;
        this.groups = groups;
        this.translatedName = translatedName;
        this.file = file;
    }
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
}
export interface ColloquiumBilet {
    Id: number;
    Title?: string;
    QuestionIds: number[];
}
