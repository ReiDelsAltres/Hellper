import { Page, TemplateHolder } from "@Purper";
export default class TestingActualPage extends Page {
    private params;
    private questions;
    /** Reveal strategy passed to each <question-component>. */
    private revealMode;
    private isExamMode;
    constructor(params?: string);
    dispose(): Promise<void>;
    protected preInit(): Promise<void>;
    /** Convert a raw exam question into a JSON-agnostic QuestionModel. */
    private toModel;
    protected postLoad(holder: TemplateHolder): Promise<void>;
    /** All question blocks, in display order. */
    private components;
    /** Build the library header for a question of this test's subject. */
    private headerFor;
    /**
     * A question reported its result. Record the outcome in the library (both flows fire
     * `answered` exactly once per question — immediately on pick, or on reveal at finish).
     * In the immediate (main) flow, also show the results popup once everything is answered.
     */
    onAnswered(event: CustomEvent): void;
    /** Deferred (exam) flow: track selections (kept for future progress UI / hooks). */
    onSelectionChange(event: CustomEvent): void;
    onFavoriteToggle(event: CustomEvent): void;
    private gatherCounts;
    private resolveEnding;
    /**
     * Build a ring of lights around the tree with count equal to number of questions
     * and mark first `correct` lights as active (green). Caps total lights to avoid huge DOM.
     */
    private updateChristmasLights;
    closeResult(): void;
    /** Show the confirmation popup before finishing the exam. */
    finishExam(): void;
    /** Cancel finishing the exam. */
    cancelFinish(): void;
    /** Confirm finishing the exam — reveal every question and show the results. */
    confirmFinish(): void;
    private regenerateShuffle;
}
//# sourceMappingURL=TestingActualPage.html.d.ts.map