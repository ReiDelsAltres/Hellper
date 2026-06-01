var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QuestionComponent_1;
import { Component, ReComponent, Attribute, Observable } from "@Purper";
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
let QuestionComponent = class QuestionComponent extends Component {
    static { QuestionComponent_1 = this; }
    Mode = new Attribute(this, "mode", "view");
    Reveal = new Attribute(this, "reveal", "immediate");
    ShowSkip = new Attribute(this, "show-skip", true);
    /**
     * When set (`<question-component drag>`), the whole card becomes draggable. On `dragstart`
     * the question id is written to the drag payload so a drop target (e.g. the test generator)
     * can identify which question was dropped. A `question-drag` CustomEvent is also emitted.
     */
    DragEnabled = new Attribute(this, "drag", false);
    /**
     * When set (`<question-component star>`), a star/favourite button is shown in the card header.
     * Clicking it toggles the starred state and emits a `favorite-toggle` CustomEvent with
     * `{ id, starred: boolean }`.
     */
    StarEnabled = new Attribute(this, "star", false);
    // ── Reactive view state (bound from the markup) ──
    titleHtml = new Observable("");
    questionId = new Observable("");
    displayIndex = new Observable("");
    indexHidden = new Observable(true);
    tags = new Observable([]);
    decoratedAnswers = new Observable([]);
    skipLabel = new Observable("Пропустить вопрос");
    skipHidden = new Observable(true);
    skipColor = new Observable("empty");
    skipDisabled = new Observable(false);
    // ── Star / favourites ──
    starred = new Observable(false);
    starIcon = new Observable("star_border");
    starColor = new Observable("empty");
    StarVisible = this.StarEnabled.createDependent((v) => v !== false && v !== "false" && v !== null && v !== undefined);
    IsExamMode = this.Mode.createDependent((value) => value === "exam");
    HasTags = this.tags.createDependent((tags) => tags.length > 0);
    // ── Internal answer state ──
    _answers = [];
    _correctIndex = -1;
    _selectedIndex = null;
    _state = "unanswered";
    _revealed = false;
    async preLoad(holder) {
        // Attributes are initialized by now — reflect the current mode into the view flags.
        this.recompute();
        this.setupDrag();
        this.DragEnabled.subscribe(() => this.setupDrag());
    }
    onDisconnected() {
        this.removeEventListener("dragstart", this.onDragStart);
        this.removeEventListener("dragend", this.onDragEnd);
    }
    // ── Drag-and-drop (opt-in via the `drag` attribute) ──
    _dragBound = false;
    /** Carries the dragged question id; used by drop targets such as the test generator. */
    static DRAG_MIME = "application/x-question-id";
    setupDrag() {
        const enabled = this.DragEnabled.value === true || this.DragEnabled.value === "true";
        if (enabled) {
            this.setAttribute("draggable", "true");
            if (!this._dragBound) {
                this.addEventListener("dragstart", this.onDragStart);
                this.addEventListener("dragend", this.onDragEnd);
                this._dragBound = true;
            }
        }
        else {
            this.removeAttribute("draggable");
        }
    }
    onDragStart = (event) => {
        const id = String(this.questionId.getObject() ?? "");
        if (!event.dataTransfer)
            return;
        event.dataTransfer.setData(QuestionComponent_1.DRAG_MIME, id);
        event.dataTransfer.setData("text/plain", id);
        event.dataTransfer.effectAllowed = "copy";
        this.classList.add("qc-dragging");
        this.dispatchEvent(new CustomEvent("question-drag", {
            detail: { id }, bubbles: true, composed: true,
        }));
    };
    onDragEnd = () => {
        this.classList.remove("qc-dragging");
    };
    /**
     * Feed the question data. Resets any previous answer state.
     * Safe to call before or after the component finished rendering — the view is reactive.
     */
    setQuestion(model) {
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
        }
        else {
            this.indexHidden.setObject(true);
        }
        if (model.skipLabel)
            this.skipLabel.setObject(model.skipLabel);
        this.recompute();
    }
    /** Current judged status of the question. */
    getStatus() {
        return this._state;
    }
    /** Whether the user has made a choice (selected an answer or skipped). */
    isAnswered() {
        return this._state !== "unanswered";
    }
    /** Index of the answer the user selected, or null when skipped / unanswered. */
    getSelectedIndex() {
        return this._selectedIndex;
    }
    /**
     * Reveal correctness and lock the question. Used for `deferred` exam flows
     * (e.g. when the user presses "finish test"). Unanswered questions become skips.
     * Idempotent. Emits `answered`.
     */
    reveal() {
        if (this._revealed)
            return;
        if (this._state === "unanswered") {
            this._state = "skip";
            this._selectedIndex = null;
        }
        this._revealed = true;
        this.recompute();
        this.dispatch("answered");
    }
    /** Clear the answer state so the question can be retaken. */
    reset() {
        this._selectedIndex = null;
        this._state = "unanswered";
        this._revealed = false;
        this.recompute();
    }
    /** Set the starred (favourited) state from outside — called by the host page on each bind. */
    setStarred(value) {
        this.starred.setObject(value);
        this.starIcon.setObject(value ? "star" : "star_border");
        this.starColor.setObject(value ? "warning" : "empty");
    }
    onStarClick() {
        const next = !this.starred.getObject();
        this.setStarred(next);
        this.dispatchEvent(new CustomEvent("favorite-toggle", {
            detail: { id: this.questionId.getObject(), starred: next },
            bubbles: true,
            composed: true,
        }));
    }
    onAnswerClick(event, element, index) {
        if (this.Mode.value !== "exam" || this._revealed)
            return;
        this._selectedIndex = index;
        this._state = this._answers[index]?.correct ? "success" : "wrong";
        this.settle();
    }
    onSkipClick(event, element) {
        if (this.Mode.value !== "exam" || this._revealed)
            return;
        this._selectedIndex = null;
        this._state = "skip";
        this.settle();
    }
    /** Apply the result of a pick depending on the reveal strategy. */
    settle() {
        if (this.Reveal.value === "deferred") {
            this.recompute();
            this.dispatch("selection-change");
        }
        else {
            this._revealed = true;
            this.recompute();
            this.dispatch("answered");
        }
    }
    /** Rebuild the reactive view state from the current answer state + mode. */
    recompute() {
        const isView = this.Mode.value === "view";
        const isExam = this.Mode.value === "exam";
        const revealed = this._revealed || isView;
        const decorated = this._answers.map((answer, i) => {
            let color = "empty";
            let variant = "filled";
            const disabled = revealed;
            if (revealed) {
                if (i === this._correctIndex) {
                    color = "success";
                    variant = this._selectedIndex === i ? "filled" : "outlined";
                }
                else if (i === this._selectedIndex) {
                    color = "error";
                }
            }
            else if (this._selectedIndex === i) {
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
    dispatch(name) {
        const detail = {
            id: this.questionId.getObject() ?? "",
            status: this._state,
            selectedIndex: this._selectedIndex,
            correctIndex: this._correctIndex,
        };
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }));
    }
};
QuestionComponent = QuestionComponent_1 = __decorate([
    ReComponent({
        markupURL: "./src/components/QuestionComponent.hmle",
        cssURL: "./src/components/QuestionComponent.html.css",
    }, "question-component")
], QuestionComponent);
export default QuestionComponent;
//# sourceMappingURL=QuestionComponent.html.js.map