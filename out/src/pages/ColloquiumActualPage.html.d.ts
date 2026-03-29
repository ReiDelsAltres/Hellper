import { Page, TemplateHolder } from "@Purper";
export default class ColloquiumActualPage extends Page {
    private params;
    private bilets;
    private questions;
    private isBiletMode;
    private isExamMode;
    constructor(params?: string);
    dispose(): Promise<void>;
    protected preInit(): Promise<void>;
    protected postLoad(holder: TemplateHolder): Promise<void>;
    revealAnswer(biletIdx: number, questionIdx: number): void;
    revealQuestionAnswer(questionIdx: number): void;
    private scoreAnswer;
    private showScoreResult;
    submitBiletQuestion(biletIdx: number, questionIdx: number): Promise<void>;
    skipBiletQuestion(biletIdx: number, questionIdx: number): void;
    submitQuestion(questionIdx: number): Promise<void>;
    skipQuestion(questionIdx: number): void;
    confirmBilet(biletIdx: number): Promise<void>;
    finishExam(): void;
    cancelFinish(): void;
    confirmFinish(): Promise<void>;
    closeResult(): void;
    private regenerateShuffle;
}
//# sourceMappingURL=ColloquiumActualPage.html.d.ts.map