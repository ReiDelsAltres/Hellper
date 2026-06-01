import { Component, ReComponent, TemplateHolder, Attribute, Observable } from "@Purper";

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

interface DecoratedAnswer {
    text: string;
    color: string;
    variant: string;
    disabled: boolean;
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
@ReComponent({
    markupURL: "./src/components/QuestionComponent.hmle",
    cssURL: "./src/components/QuestionComponent.html.css",
}, "question-component")
export default class QuestionComponent extends Component {
    public Mode: Attribute<QuestionMode> = new Attribute<QuestionMode>(this, "mode", "view");
    public Reveal: Attribute<QuestionReveal> = new Attribute<QuestionReveal>(this, "reveal", "immediate");
    public ShowSkip: Attribute<boolean> = new Attribute<boolean>(this, "show-skip", true);
    /**
     * When set (`<question-component drag>`), the whole card becomes draggable. On `dragstart`
     * the question id is written to the drag payload so a drop target (e.g. the test generator)
     * can identify which question was dropped. A `question-drag` CustomEvent is also emitted.
     */
    public DragEnabled: Attribute<boolean> = new Attribute<boolean>(this, "drag", false);
    /**
     * When set (`<question-component star>`), a star/favourite button is shown in the card header.
     * Clicking it toggles the starred state and emits a `favorite-toggle` CustomEvent with
     * `{ id, starred: boolean }`.
     */
    public StarEnabled: Attribute<boolean> = new Attribute<boolean>(this, "star", false);

    // ── Reactive view state (bound from the markup) ──
    private titleHtml: Observable<string> = new Observable<string>("");
    private questionId: Observable<string | number> = new Observable<string | number>("");
    private displayIndex: Observable<string | number> = new Observable<string | number>("");
    private indexHidden: Observable<boolean> = new Observable<boolean>(true);
    private tags: Observable<QuestionTag[]> = new Observable<QuestionTag[]>([]);
    private decoratedAnswers: Observable<DecoratedAnswer[]> = new Observable<DecoratedAnswer[]>([]);
    private skipLabel: Observable<string> = new Observable<string>("Пропустить вопрос");
    private skipHidden: Observable<boolean> = new Observable<boolean>(true);
    private skipColor: Observable<string> = new Observable<string>("empty");
    private skipDisabled: Observable<boolean> = new Observable<boolean>(false);

    // ── Star / favourites ──
    private starred: Observable<boolean> = new Observable<boolean>(false);
    private starIcon: Observable<string> = new Observable<string>("star_border");
    private starColor: Observable<string> = new Observable<string>("empty");
    private StarVisible = this.StarEnabled.createDependent((v: any) => v !== false && v !== "false" && v !== null && v !== undefined);

    private IsExamMode = this.Mode.createDependent((value: string) => value === "exam");
    private HasTags = this.tags.createDependent((tags: QuestionTag[]) => tags.length > 0);
    // ── Internal answer state ──
    private _answers: QuestionAnswerModel[] = [];
    private _correctIndex: number = -1;
    private _selectedIndex: number | null = null;
    private _state: QuestionStatus = "unanswered";
    private _revealed: boolean = false;

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        // Attributes are initialized by now — reflect the current mode into the view flags.
        this.recompute();
        this.setupDrag();
        this.DragEnabled.subscribe(() => this.setupDrag());
    }

    public onDisconnected(): void {
        this.removeEventListener("dragstart", this.onDragStart);
        this.removeEventListener("dragend", this.onDragEnd);
    }

    // ── Drag-and-drop (opt-in via the `drag` attribute) ──
    private _dragBound = false;

    /** Carries the dragged question id; used by drop targets such as the test generator. */
    public static readonly DRAG_MIME = "application/x-question-id";

    private setupDrag(): void {
        const enabled = this.DragEnabled.value === true || (this.DragEnabled.value as unknown) === "true";
        if (enabled) {
            this.setAttribute("draggable", "true");
            if (!this._dragBound) {
                this.addEventListener("dragstart", this.onDragStart);
                this.addEventListener("dragend", this.onDragEnd);
                this._dragBound = true;
            }
        } else {
            this.removeAttribute("draggable");
        }
    }

    private onDragStart = (event: DragEvent): void => {
        const id = String(this.questionId.getObject() ?? "");
        if (!event.dataTransfer) return;
        event.dataTransfer.setData(QuestionComponent.DRAG_MIME, id);
        event.dataTransfer.setData("text/plain", id);
        event.dataTransfer.effectAllowed = "copy";
        this.classList.add("qc-dragging");
        this.dispatchEvent(new CustomEvent("question-drag", {
            detail: { id }, bubbles: true, composed: true,
        }));
    };

    private onDragEnd = (): void => {
        this.classList.remove("qc-dragging");
    };

    /**
     * Feed the question data. Resets any previous answer state.
     * Safe to call before or after the component finished rendering — the view is reactive.
     */
    public setQuestion(model: QuestionModel): void {
        this._answers = model.answers ?? [];
        this._correctIndex = this._answers.findIndex(a => a.correct);
        this._selectedIndex = null;
        this._state = "unanswered";
        this._revealed = false;

        this.titleHtml.setObject(model.title ?? "");
        this.questionId.setObject(model.id ?? "");
        this.tags.setObject(model.tags ?? []);

        if (model.index !== undefined && model.index !== null && model.index !== "") {
            this.displayIndex.setObject(model.index);
            this.indexHidden.setObject(false);
        } else {
            this.indexHidden.setObject(true);
        }

        if (model.skipLabel) this.skipLabel.setObject(model.skipLabel);

        this.recompute();
    }

    /** Current judged status of the question. */
    public getStatus(): QuestionStatus {
        return this._state;
    }

    /** Whether the user has made a choice (selected an answer or skipped). */
    public isAnswered(): boolean {
        return this._state !== "unanswered";
    }

    /** Index of the answer the user selected, or null when skipped / unanswered. */
    public getSelectedIndex(): number | null {
        return this._selectedIndex;
    }

    /**
     * Reveal correctness and lock the question. Used for `deferred` exam flows
     * (e.g. when the user presses "finish test"). Unanswered questions become skips.
     * Idempotent. Emits `answered`.
     */
    public reveal(): void {
        if (this._revealed) return;
        if (this._state === "unanswered") {
            this._state = "skip";
            this._selectedIndex = null;
        }
        this._revealed = true;
        this.recompute();
        this.dispatch("answered");
    }

    /** Clear the answer state so the question can be retaken. */
    public reset(): void {
        this._selectedIndex = null;
        this._state = "unanswered";
        this._revealed = false;
        this.recompute();
    }

    /** Set the starred (favourited) state from outside — called by the host page on each bind. */
    public setStarred(value: boolean): void {
        this.starred.setObject(value);
        this.starIcon.setObject(value ? "star" : "star_border");
        this.starColor.setObject(value ? "warning" : "empty");
    }

    public onStarClick(): void {
        const next = !this.starred.getObject();
        this.setStarred(next);
        this.dispatchEvent(new CustomEvent("favorite-toggle", {
            detail: { id: this.questionId.getObject(), starred: next },
            bubbles: true,
            composed: true,
        }));
    }

    public onAnswerClick(event: Event, element: HTMLElement, index: number): void {
        if (this.Mode.value !== "exam" || this._revealed) return;

        this._selectedIndex = index;
        this._state = this._answers[index]?.correct ? "success" : "wrong";
        this.settle();
    }

    public onSkipClick(event: Event, element: HTMLElement): void {
        if (this.Mode.value !== "exam" || this._revealed) return;

        this._selectedIndex = null;
        this._state = "skip";
        this.settle();
    }

    /** Apply the result of a pick depending on the reveal strategy. */
    private settle(): void {
        if (this.Reveal.value === "deferred") {
            this.recompute();
            this.dispatch("selection-change");
        } else {
            this._revealed = true;
            this.recompute();
            this.dispatch("answered");
        }
    }

    /** Rebuild the reactive view state from the current answer state + mode. */
    private recompute(): void {
        const isView = this.Mode.value === "view";
        const isExam = this.Mode.value === "exam";
        const revealed = this._revealed || isView;

        const decorated: DecoratedAnswer[] = this._answers.map((answer, i) => {
            let color = "empty";
            let variant = "filled";
            const disabled = revealed;

            if (revealed) {
                if (i === this._correctIndex) {
                    color = "success";
                    variant = this._selectedIndex === i ? "filled" : "outlined";
                } else if (i === this._selectedIndex) {
                    color = "error";
                }
            } else if (this._selectedIndex === i) {
                // Deferred selection: highlight the pick without giving away correctness.
                color = "primary";
            }

            return { text: answer.text, color, variant, disabled };
        });
        this.decoratedAnswers.setObject(decorated);

        const skipShown = isExam && this.ShowSkip.value !== false && this.ShowSkip.value !== "false";
        this.skipHidden.setObject(!skipShown);
        this.skipDisabled.setObject(this._revealed);
        this.skipColor.setObject(this._state === "skip" ? "warning" : "empty");
    }

    private dispatch(name: "answered" | "selection-change"): void {
        const detail: QuestionEventDetail = {
            id: this.questionId.getObject() ?? "",
            status: this._state,
            selectedIndex: this._selectedIndex,
            correctIndex: this._correctIndex,
        };
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }));
    }
}
