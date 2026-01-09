import { IElementHolder, Page } from "@Purper";
export default class TestingActualPage extends Page {
    private params;
    private questions;
    private statuses;
    private selectedAnswers;
    private isExamMode;
    constructor(params?: string);
    dispose(): Promise<void>;
    protected preInit(): Promise<void>;
    protected postLoad(holder: IElementHolder): Promise<void>;
    private masonryResizeObserver?;
    private layoutMasonryHandler?;
    private initMasonry;
    private resolveEnding;
    /**
     * Build a ring of lights around the tree with count equal to number of questions
     * and mark first `correct` lights as active (green). Caps total lights to avoid huge DOM.
     */
    private updateChristmasLights;
    closeResult(): void;
    handleClick(event: Event, element: HTMLElement, params: {
        qidx: number;
        aidx: number;
        c0: string;
        c1: string;
        c2: string;
    }): void;
    /**
     * Показать popup подтверждения завершения экзамена
     */
    finishExam(): void;
    /**
     * Отменить завершение экзамена
     */
    cancelFinish(): void;
    /**
     * Подтвердить завершение экзамена - показать все результаты
     */
    confirmFinish(): void;
    private regenerateShuffle;
}
//# sourceMappingURL=TestingActualPage.html.d.ts.map