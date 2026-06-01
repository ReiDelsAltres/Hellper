import { Component, TemplateHolder, Attribute } from "@Purper";
/**
 * Mode of a {@link QuestionComponent}:
 * - `exam` — interactive: the user picks an answer, the block decides correctness and emits events.
 * - `view` — read-only: answers are shown as disabled buttons, the correct one is highlighted.
 */
export type QuestionMode = "exam" | "view";
/**
 * When (in `exam` mode) correctness is revealed to the user:
 * - `immediate` — revealed right after the click (and an `answered` event is emitted).
 * - `deferred`  — only selection is shown; correctness stays hidden until {@link QuestionComponent.reveal} is called.
 */
export type QuestionReveal = "immediate" | "deferred";
export type QuestionStatus = "success" | "wrong" | "skip" | "unanswered";
/** A single answer option. `text` may contain pre-rendered HTML (e.g. KaTeX). */
export interface QuestionAnswerModel {
    text: string;
    correct: boolean;
}
/** Extra chip rendered in the question header (e.g. subject / type label). */
export interface QuestionTag {
    text: string;
    color?: string;
}
/**
 * Data contract for {@link QuestionComponent}. The component never touches JSON directly —
 * the hosting page maps its data source into this shape and pushes it via {@link QuestionComponent.setQuestion}.
 */
export interface QuestionModel {
    id: number | string;
    /** Optional display position chip (1-based). Hidden when omitted. */
    index?: number | string;
    /** Question text. May contain pre-rendered HTML. */
    title: string;
    answers: QuestionAnswerModel[];
    /** Optional extra header chips. */
    tags?: QuestionTag[];
    /** Override the skip-button label. */
    skipLabel?: string;
}
/** Detail payload for the `answered` / `selection-change` events. */
export interface QuestionEventDetail {
    id: number | string;
    status: QuestionStatus;
    selectedIndex: number | null;
    correctIndex: number;
}
/**
 * Universal, self-contained question block for testing pages.
 *
 * Renders a header (position / id / tag chips + title) and the answer buttons.
 * In `exam` mode it owns the answer logic (selection, correctness, skip) and emits:
 *   - `selection-change` — on every pick while in `deferred` reveal mode.
 *   - `answered` — once the result is revealed (immediately on pick, or when {@link reveal} is called).
 *
 * The component is data-source agnostic: feed it a {@link QuestionModel} through {@link setQuestion}.
 */
export default class QuestionComponent extends Component {
    Mode: Attribute<QuestionMode>;
    Reveal: Attribute<QuestionReveal>;
    ShowSkip: Attribute<boolean>;
    /**
     * When set (`<question-component drag>`), the whole card becomes draggable. On `dragstart`
     * the question id is written to the drag payload so a drop target (e.g. the test generator)
     * can identify which question was dropped. A `question-drag` CustomEvent is also emitted.
     */
    DragEnabled: Attribute<boolean>;
    /**
     * When set (`<question-component star>`), a star/favourite button is shown in the card header.
     * Clicking it toggles the starred state and emits a `favorite-toggle` CustomEvent with
     * `{ id, starred: boolean }`.
     */
    StarEnabled: Attribute<boolean>;
    private titleHtml;
    private questionId;
    private displayIndex;
    private indexHidden;
    private tags;
    private decoratedAnswers;
    private skipLabel;
    private skipHidden;
    private skipColor;
    private skipDisabled;
    private starred;
    private starIcon;
    private starColor;
    private StarVisible;
    private IsExamMode;
    private HasTags;
    private _answers;
    private _correctIndex;
    private _selectedIndex;
    private _state;
    private _revealed;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    onDisconnected(): void;
    private _dragBound;
    /** Carries the dragged question id; used by drop targets such as the test generator. */
    static readonly DRAG_MIME = "application/x-question-id";
    private setupDrag;
    private onDragStart;
    private onDragEnd;
    /**
     * Feed the question data. Resets any previous answer state.
     * Safe to call before or after the component finished rendering — the view is reactive.
     */
    setQuestion(model: QuestionModel): void;
    /** Current judged status of the question. */
    getStatus(): QuestionStatus;
    /** Whether the user has made a choice (selected an answer or skipped). */
    isAnswered(): boolean;
    /** Index of the answer the user selected, or null when skipped / unanswered. */
    getSelectedIndex(): number | null;
    /**
     * Reveal correctness and lock the question. Used for `deferred` exam flows
     * (e.g. when the user presses "finish test"). Unanswered questions become skips.
     * Idempotent. Emits `answered`.
     */
    reveal(): void;
    /** Clear the answer state so the question can be retaken. */
    reset(): void;
    /** Set the starred (favourited) state from outside — called by the host page on each bind. */
    setStarred(value: boolean): void;
    onStarClick(): void;
    onAnswerClick(event: Event, element: HTMLElement, index: number): void;
    onSkipClick(event: Event, element: HTMLElement): void;
    /** Apply the result of a pick depending on the reveal strategy. */
    private settle;
    /** Rebuild the reactive view state from the current answer state + mode. */
    private recompute;
    private dispatch;
}
//# sourceMappingURL=QuestionComponent.html.d.ts.map