var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { AccessType, Fetcher, Page, RePage } from "@Purper";
import SeededShuffle from "../lib/SeededShuffle.js";
import { KatexUtils } from "../KatexUtils.js";
let TestingActualPage = class TestingActualPage extends Page {
    params;
    questions;
    statuses = [];
    constructor(params) {
        super();
        this.params = JSON.parse(decodeURIComponent(params));
    }
    async preInit() {
        const jj = await Fetcher.fetchJSON('../../resources/data' + '/' + this.params.subject.file);
        var i = 1;
        this.questions = jj.Questions
            .map((q, idx) => new TemporaryQuestion(q, idx + 1, i++));
        this.questions = SeededShuffle.shuffle(this.questions, this.params.randomSource);
        if (this.params.limits && this.params.limits > 0) {
            this.questions = this.questions.slice(0, Number(this.params.limits));
        }
        this.statuses = new Array(this.questions.length).fill(AnswerStatus.UNANSWERED);
        var seed = this.params.randomSource;
        this.questions.forEach(q => {
            q.shuffleAnswers(seed);
            seed = SeededShuffle.deriveNextSeed(seed);
            q.Answers.push("Пропустить вопрос");
        });
        return Promise.resolve();
    }
    async postLoad(holder) {
        // Auto-render KaTeX formulas (if any) inside page content after render
        try {
            // KatexUtils.autoRender accepts an Element — holder.element may be a DocumentFragment
            const el = holder.element;
            if (el)
                KatexUtils.autoRender(el);
        }
        catch (e) {
            // non-fatal — continue without breaking page
            console.warn('KaTeX auto-render failed', e);
        }
    }
    resolveEnding() {
        if (this.statuses.some(s => s === AnswerStatus.UNANSWERED))
            return;
        const correct = this.statuses.filter(s => s === AnswerStatus.SUCCESS).length;
        const wrong = this.statuses.filter(s => s === AnswerStatus.WRONG).length;
        const skip = this.statuses.filter(s => s === AnswerStatus.SKIP).length;
        // Update popup content
        this['resultCorrect'].textContent = String(correct);
        this['resultWrong'].textContent = String(wrong);
        this['resultSkip'].textContent = String(skip);
        //25 => 24 * 2 - 1 = 47;
        if (this.questions.length === 25) {
            const score = (correct * 2) - wrong;
            this['resultScore'].textContent = String(score);
            this['resultScoreBlock'].style.display = 'block';
        }
        // Open result popup
        this['resultPopup'].open();
    }
    closeResult() {
        this['resultPopup'].close();
    }
    handleClick(event, element, params) {
        const { qidx, aidx, c0, c1, c2 } = params;
        console.log('Clicked answer:', params);
        for (const c of [c0, c1, c2]) {
            const chip = this[c];
            chip.setAttribute("disabled", "true");
        }
        for (let i = 0; i < 6; i++) {
            const tt = this[qidx + "-" + i];
            tt.setAttribute("disabled", "true");
            if (tt === element)
                continue;
            const question = this.questions[qidx];
            switch (i) {
                case question.RDd:
                    tt.setAttribute('color', 'success');
                    tt.setAttribute("variant", "outlined");
                    break;
            }
        }
        const question = this.questions[qidx];
        switch (aidx) {
            case question.RDd:
                element.setAttribute('color', 'success');
                this.statuses[qidx] = AnswerStatus.SUCCESS;
                break;
            case question.Answers.length - 1:
                element.setAttribute('color', 'warning');
                this.statuses[qidx] = AnswerStatus.SKIP;
                break;
            default:
                element.setAttribute('color', 'error');
                this.statuses[qidx] = AnswerStatus.WRONG;
                break;
        }
        this.resolveEnding();
    }
};
TestingActualPage = __decorate([
    RePage("./src/pages/TestingActualPage.hmle", "./src/pages/TestingActualPage.html.css", "./src/pages/TestingActualPage.html.ts", AccessType.BOTH, "/testing/actual"),
    __metadata("design:paramtypes", [String])
], TestingActualPage);
export default TestingActualPage;
var AnswerStatus;
(function (AnswerStatus) {
    AnswerStatus["SUCCESS"] = "success";
    AnswerStatus["WRONG"] = "wrong";
    AnswerStatus["SKIP"] = "skip";
    AnswerStatus["UNANSWERED"] = "unanswered";
})(AnswerStatus || (AnswerStatus = {}));
class TemporaryQuestion {
    Id;
    RDd;
    Title;
    Answers;
    localId;
    constructor(data, fallbackId, localId) {
        this.Id = data.Id ?? fallbackId;
        this.RDd = data.RDd ?? 0;
        this.Title = data.Title;
        this.Answers = data.Answers;
        this.localId = localId;
    }
    isCorrect(index) {
        return index === this.RDd;
    }
    shuffleAnswers(uuid) {
        if (!uuid || this.Answers.length <= 1)
            return;
        const { shuffled, newIndexForOld } = SeededShuffle.shuffleWithMapping(this.Answers.slice(), uuid);
        const oldCorrect = this.RDd;
        this.Answers = shuffled;
        this.RDd = (newIndexForOld && typeof newIndexForOld[oldCorrect] === 'number') ? newIndexForOld[oldCorrect] : 0;
    }
    toJSON() {
        return { Id: this.Id, RDd: this.RDd, Title: this.Title, Answers: this.Answers.slice() };
    }
}
//# sourceMappingURL=TestingActualPage.html.js.map