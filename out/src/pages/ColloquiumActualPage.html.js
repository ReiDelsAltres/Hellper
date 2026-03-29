var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Fetcher, Page, RePage, Router } from "@Purper";
import SeededShuffle from "../lib/SeededShuffle.js";
import SimilarityScorer from "../lib/SimilarityScorer.js";
let ColloquiumActualPage = class ColloquiumActualPage extends Page {
    params;
    bilets = [];
    questions = [];
    isBiletMode = false;
    isExamMode = false;
    constructor(params) {
        super();
        this.params = JSON.parse(decodeURIComponent(params));
    }
    async dispose() { }
    async preInit() {
        if (this.params.randomSource === null) {
            this.params.randomSource = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
                ? crypto.randomUUID()
                : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
        }
        SimilarityScorer.preload();
        const data = await Fetcher.fetchJSON('./resources/data/' + this.params.subject.file);
        this.isBiletMode = this.params.contentType === 'bilets' || this.params.contentType === 'runtime';
        this.isExamMode = this.params.testType === 'exam';
        const questionsMap = new Map();
        data.Questions.forEach(q => questionsMap.set(q.Id, q));
        if (this.params.contentType === 'runtime') {
            const BILET_SIZE = 5;
            let allQuestions = [...data.Questions];
            if (!this.params.noShuffle) {
                allQuestions = SeededShuffle.shuffle(allQuestions, this.params.randomSource);
            }
            let bilets = [];
            for (let i = 0; i < allQuestions.length; i += BILET_SIZE) {
                const chunk = allQuestions.slice(i, i + BILET_SIZE);
                const biletIdx = Math.floor(i / BILET_SIZE);
                const questions = chunk.map((q, qIdx) => new DisplayQuestion(q, qIdx));
                bilets.push(new DisplayBilet(biletIdx + 1, `Билет ${biletIdx + 1}`, questions, biletIdx));
            }
            if (this.params.limits && this.params.limits > 0) {
                bilets = bilets.slice(0, Number(this.params.limits));
            }
            this.bilets = bilets;
        }
        else if (this.isBiletMode && data.Bilets) {
            let bilets = data.Bilets.map((b, idx) => {
                const questions = b.QuestionIds
                    .map(id => questionsMap.get(id))
                    .filter(q => q !== undefined)
                    .map((q, qIdx) => new DisplayQuestion(q, qIdx));
                return new DisplayBilet(b.Id, b.Title, questions, idx);
            });
            if (!this.params.noShuffle) {
                bilets = SeededShuffle.shuffle(bilets, this.params.randomSource);
            }
            if (this.params.limits && this.params.limits > 0) {
                bilets = bilets.slice(0, Number(this.params.limits));
            }
            this.bilets = bilets;
        }
        else {
            let questions = data.Questions.map((q, idx) => new DisplayQuestion(q, idx));
            if (!this.params.noShuffle) {
                questions = SeededShuffle.shuffle(questions, this.params.randomSource);
            }
            if (this.params.limits && this.params.limits > 0) {
                questions = questions.slice(0, Number(this.params.limits));
            }
            this.questions = questions;
        }
    }
    async postLoad(holder) {
        const restartContainer = this['restartContainer'];
        if (restartContainer)
            restartContainer.style.display = 'none';
        const finishContainer = this['finishExamContainer'];
        if (finishContainer) {
            finishContainer.style.display = this.isExamMode ? 'block' : 'none';
        }
        // In exam mode: hide per-bilet confirm buttons
        if (this.isExamMode) {
            this.bilets.forEach((_, bidx) => {
                const confirmBtn = this['confirm_' + bidx];
                if (confirmBtn)
                    confirmBtn.style.display = 'none';
            });
        }
    }
    revealAnswer(biletIdx, questionIdx) {
        const answerBlock = this['answer_' + biletIdx + '_' + questionIdx];
        if (answerBlock)
            answerBlock.style.display = 'block';
        const ta = this['ta_' + biletIdx + '_' + questionIdx];
        const userText = ta?.Value?.value ?? '';
        const userAnswerEl = this['useranswer_' + biletIdx + '_' + questionIdx];
        if (userAnswerEl)
            userAnswerEl.textContent = userText.trim() || '(нет ответа)';
        const inputRow = this['inputrow_' + biletIdx + '_' + questionIdx];
        if (inputRow)
            inputRow.style.display = 'none';
        if (ta)
            ta.setAttribute('disabled', '');
    }
    revealQuestionAnswer(questionIdx) {
        const answerBlock = this['qanswer_' + questionIdx];
        if (answerBlock)
            answerBlock.style.display = 'block';
        const ta = this['qta_' + questionIdx];
        const userText = ta?.Value?.value ?? '';
        const userAnswerEl = this['quseranswer_' + questionIdx];
        if (userAnswerEl)
            userAnswerEl.textContent = userText.trim() || '(нет ответа)';
        const inputRow = this['qinputrow_' + questionIdx];
        if (inputRow)
            inputRow.style.display = 'none';
        if (ta)
            ta.setAttribute('disabled', '');
    }
    async scoreAnswer(userText, answers, keywords) {
        return SimilarityScorer.score(userText, answers, keywords);
    }
    showScoreResult(scoreEl, lengthEl, result) {
        scoreEl.style.display = 'inline-flex';
        scoreEl.textContent = result.score + '%';
        if (result.score >= 80)
            scoreEl.setAttribute('color', 'success');
        else if (result.score >= 50)
            scoreEl.setAttribute('color', 'warning');
        else
            scoreEl.setAttribute('color', 'error');
        if (lengthEl) {
            if (result.lengthMismatch) {
                lengthEl.style.display = 'block';
                const pct = Math.round(result.lengthRatio * 100);
                lengthEl.textContent = `⚠ Размер ответа недостаточен (${pct}% от эталона, минимум 70%)`;
            }
            else {
                lengthEl.style.display = 'none';
            }
        }
    }
    async submitBiletQuestion(biletIdx, questionIdx) {
        const bilet = this.bilets[biletIdx];
        if (!bilet)
            return;
        const question = bilet.questions[questionIdx];
        if (!question || question.status !== AnswerStatus.UNANSWERED)
            return;
        const submitBtn = this['submit_' + biletIdx + '_' + questionIdx];
        const skipBtn = this['skip_' + biletIdx + '_' + questionIdx];
        if (submitBtn)
            submitBtn.setAttribute('disabled', '');
        if (skipBtn)
            skipBtn.setAttribute('disabled', '');
        const ta = this['ta_' + biletIdx + '_' + questionIdx];
        const userText = ta?.Value?.value ?? '';
        const result = await this.scoreAnswer(userText, question.Answers, question.Keywords);
        question.status = result.score >= 50 ? AnswerStatus.SUCCESS : AnswerStatus.WRONG;
        question.score = result.score;
        this.revealAnswer(biletIdx, questionIdx);
        const scoreEl = this['score_' + biletIdx + '_' + questionIdx];
        const lengthEl = this['lenwarning_' + biletIdx + '_' + questionIdx];
        if (scoreEl) {
            this.showScoreResult(scoreEl, lengthEl, result);
        }
    }
    skipBiletQuestion(biletIdx, questionIdx) {
        const bilet = this.bilets[biletIdx];
        if (!bilet)
            return;
        const question = bilet.questions[questionIdx];
        if (!question || question.status !== AnswerStatus.UNANSWERED)
            return;
        question.status = AnswerStatus.WRONG;
        question.score = 0;
        this.revealAnswer(biletIdx, questionIdx);
    }
    async submitQuestion(questionIdx) {
        const question = this.questions[questionIdx];
        if (!question || question.status !== AnswerStatus.UNANSWERED)
            return;
        const submitBtn = this['qsubmit_' + questionIdx];
        const skipBtn = this['qskip_' + questionIdx];
        if (submitBtn)
            submitBtn.setAttribute('disabled', '');
        if (skipBtn)
            skipBtn.setAttribute('disabled', '');
        const ta = this['qta_' + questionIdx];
        const userText = ta?.Value?.value ?? '';
        const result = await this.scoreAnswer(userText, question.Answers, question.Keywords);
        question.status = result.score >= 50 ? AnswerStatus.SUCCESS : AnswerStatus.WRONG;
        question.score = result.score;
        this.revealQuestionAnswer(questionIdx);
        const scoreEl = this['qscore_' + questionIdx];
        const lengthEl = this['qlenwarning_' + questionIdx];
        if (scoreEl) {
            this.showScoreResult(scoreEl, lengthEl, result);
        }
    }
    skipQuestion(questionIdx) {
        const question = this.questions[questionIdx];
        if (!question || question.status !== AnswerStatus.UNANSWERED)
            return;
        question.status = AnswerStatus.WRONG;
        question.score = 0;
        this.revealQuestionAnswer(questionIdx);
    }
    async confirmBilet(biletIdx) {
        const bilet = this.bilets[biletIdx];
        if (!bilet)
            return;
        const confirmBtn = this['confirm_' + biletIdx];
        if (confirmBtn)
            confirmBtn.setAttribute('disabled', 'true');
        // Score unanswered questions via NLP, skip ones with no text
        for (let qIdx = 0; qIdx < bilet.questions.length; qIdx++) {
            const q = bilet.questions[qIdx];
            let result = { score: 0, lengthMismatch: true, lengthRatio: 0 };
            if (q.status === AnswerStatus.UNANSWERED) {
                const ta = this['ta_' + biletIdx + '_' + qIdx];
                const userText = ta?.Value?.value ?? '';
                if (userText.trim().length > 0) {
                    result = await this.scoreAnswer(userText, q.Answers, q.Keywords);
                    q.status = result.score >= 50 ? AnswerStatus.SUCCESS : AnswerStatus.WRONG;
                    q.score = result.score;
                }
                else {
                    q.status = AnswerStatus.WRONG;
                    q.score = 0;
                }
            }
            this.revealAnswer(biletIdx, qIdx);
            const scoreEl = this['score_' + biletIdx + '_' + qIdx];
            const lengthEl = this['lenwarning_' + biletIdx + '_' + qIdx];
            if (scoreEl && q.score !== undefined) {
                this.showScoreResult(scoreEl, lengthEl, result);
            }
        }
        const totalScore = bilet.questions.reduce((sum, q) => sum + (q.score ?? 0), 0);
        const accuracy = bilet.questions.length > 0
            ? Math.round(totalScore / bilet.questions.length)
            : 0;
        const accuracyEl = this['accuracy_' + biletIdx];
        if (accuracyEl) {
            accuracyEl.style.display = 'inline-flex';
            accuracyEl.textContent = accuracy + '%';
            if (accuracy >= 80)
                accuracyEl.setAttribute('color', 'success');
            else if (accuracy >= 50)
                accuracyEl.setAttribute('color', 'warning');
            else
                accuracyEl.setAttribute('color', 'error');
        }
    }
    finishExam() {
        this['confirmPopup'].open();
    }
    cancelFinish() {
        this['confirmPopup'].close();
    }
    async confirmFinish() {
        this['confirmPopup'].close();
        let totalScore = 0;
        let totalItems = 0;
        if (this.isBiletMode) {
            for (let bidx = 0; bidx < this.bilets.length; bidx++) {
                const bilet = this.bilets[bidx];
                for (let qidx = 0; qidx < bilet.questions.length; qidx++) {
                    const q = bilet.questions[qidx];
                    let result = { score: q.score, lengthMismatch: false, lengthRatio: 1 };
                    if (q.status === AnswerStatus.UNANSWERED) {
                        const ta = this['ta_' + bidx + '_' + qidx];
                        const userText = ta?.Value?.value ?? '';
                        if (userText.trim().length > 0) {
                            result = await this.scoreAnswer(userText, q.Answers, q.Keywords);
                            q.status = result.score >= 50 ? AnswerStatus.SUCCESS : AnswerStatus.WRONG;
                            q.score = result.score;
                        }
                        else {
                            q.status = AnswerStatus.WRONG;
                            q.score = 0;
                            result = { score: 0, lengthMismatch: true, lengthRatio: 0 };
                        }
                    }
                    this.revealAnswer(bidx, qidx);
                    const scoreEl = this['score_' + bidx + '_' + qidx];
                    const lengthEl = this['lenwarning_' + bidx + '_' + qidx];
                    if (scoreEl) {
                        this.showScoreResult(scoreEl, lengthEl, result);
                    }
                    totalScore += q.score ?? 0;
                    totalItems++;
                }
                const biletScore = bilet.questions.reduce((s, q) => s + (q.score ?? 0), 0);
                const accuracy = bilet.questions.length > 0
                    ? Math.round(biletScore / bilet.questions.length)
                    : 0;
                const accuracyEl = this['accuracy_' + bidx];
                if (accuracyEl) {
                    accuracyEl.style.display = 'inline-flex';
                    accuracyEl.textContent = accuracy + '%';
                    if (accuracy >= 80)
                        accuracyEl.setAttribute('color', 'success');
                    else if (accuracy >= 50)
                        accuracyEl.setAttribute('color', 'warning');
                    else
                        accuracyEl.setAttribute('color', 'error');
                }
                const confirmBtn = this['confirm_' + bidx];
                if (confirmBtn)
                    confirmBtn.setAttribute('disabled', 'true');
            }
        }
        else {
            for (let qidx = 0; qidx < this.questions.length; qidx++) {
                const q = this.questions[qidx];
                let result = { score: q.score, lengthMismatch: false, lengthRatio: 1 };
                if (q.status === AnswerStatus.UNANSWERED) {
                    const ta = this['qta_' + qidx];
                    const userText = ta?.Value?.value ?? '';
                    if (userText.trim().length > 0) {
                        result = await this.scoreAnswer(userText, q.Answers, q.Keywords);
                        q.status = result.score >= 50 ? AnswerStatus.SUCCESS : AnswerStatus.WRONG;
                        q.score = result.score;
                    }
                    else {
                        q.status = AnswerStatus.WRONG;
                        q.score = 0;
                        result = { score: 0, lengthMismatch: true, lengthRatio: 0 };
                    }
                }
                this.revealQuestionAnswer(qidx);
                const scoreEl = this['qscore_' + qidx];
                const lengthEl = this['qlenwarning_' + qidx];
                if (scoreEl) {
                    this.showScoreResult(scoreEl, lengthEl, result);
                }
                totalScore += q.score ?? 0;
                totalItems++;
            }
        }
        const overallAccuracy = totalItems > 0 ? Math.round(totalScore / totalItems) : 0;
        const correct = this.isBiletMode
            ? this.bilets.flatMap(b => b.questions).filter(q => q.status === AnswerStatus.SUCCESS).length
            : this.questions.filter(q => q.status === AnswerStatus.SUCCESS).length;
        const wrong = totalItems - correct;
        this['resultCorrect'].textContent = String(correct);
        this['resultWrong'].textContent = String(wrong);
        this['resultAccuracy'].textContent = overallAccuracy + '%';
        this['resultPopup'].open();
        const finishContainer = this['finishExamContainer'];
        if (finishContainer)
            finishContainer.style.display = 'none';
    }
    closeResult() {
        this['resultPopup'].close();
        const restartContainer = this['restartContainer'];
        if (restartContainer)
            restartContainer.style.display = 'block';
    }
    regenerateShuffle() {
        const newSeed = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
        this.params.randomSource = newSeed;
        const paramsStr = encodeURIComponent(JSON.stringify(this.params));
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/colloquim/actual?params=' + paramsStr)), true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};
ColloquiumActualPage = __decorate([
    RePage({
        markupURL: "./src/pages/ColloquiumActualPage.hmle",
        cssURL: "./src/pages/ColloquiumActualPage.html.css",
        jsURL: "./src/pages/ColloquiumActualPage.html.ts",
    }, "/colloquim/actual"),
    __metadata("design:paramtypes", [String])
], ColloquiumActualPage);
export default ColloquiumActualPage;
var AnswerStatus;
(function (AnswerStatus) {
    AnswerStatus["SUCCESS"] = "success";
    AnswerStatus["WRONG"] = "wrong";
    AnswerStatus["UNANSWERED"] = "unanswered";
})(AnswerStatus || (AnswerStatus = {}));
class DisplayQuestion {
    Id;
    Title;
    Answers;
    Keywords;
    localIdx;
    status = AnswerStatus.UNANSWERED;
    score = 0;
    constructor(data, localIdx) {
        this.Id = data.Id;
        this.Title = data.Title;
        this.Answers = data.Answers ?? [];
        this.Keywords = data.Keywords ?? [];
        this.localIdx = localIdx;
    }
}
class DisplayBilet {
    Id;
    Title;
    questions;
    localIdx;
    constructor(id, title, questions, localIdx) {
        this.Id = id;
        this.Title = title ?? 'Билет ' + id;
        this.questions = questions;
        this.localIdx = localIdx;
    }
}
//# sourceMappingURL=ColloquiumActualPage.html.js.map