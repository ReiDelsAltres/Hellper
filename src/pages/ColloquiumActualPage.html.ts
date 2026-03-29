import { AccessType, Fetcher, IElementHolder, Page, RePage, Router, TemplateHolder } from "@Purper";
import { Subject, ColloquiumFile, ColloquiumQuestion, ColloquiumBilet } from "../frac/Testing.js";
import SeededShuffle from "../lib/SeededShuffle.js";
import PopUp from "../components/PopUp.html.js";
import ReTextArea from "../components/ReTextArea.html.js";
import SimilarityScorer, { ScoreResult } from "../lib/SimilarityScorer.js";

@RePage({
    markupURL: "./src/pages/ColloquiumActualPage.hmle",
    cssURL: "./src/pages/ColloquiumActualPage.html.css",
    jsURL: "./src/pages/ColloquiumActualPage.html.ts",
}, "/colloquim/actual")
export default class ColloquiumActualPage extends Page {
    private params: {
        subject: Subject,
        type: string,
        contentType: "questions" | "bilets" | "runtime",
        limits: number,
        testType: "main" | "exam",
        randomSource: string,
        noShuffle: boolean
    };

    private bilets: DisplayBilet[] = [];
    private questions: DisplayQuestion[] = [];
    private isBiletMode: boolean = false;
    private isExamMode: boolean = false;

    public constructor(params?: string) {
        super();
        this.params = JSON.parse(decodeURIComponent(params));
    }

    public async dispose(): Promise<void> { }

    protected async preInit(): Promise<void> {
        if (this.params.randomSource === null) {
            this.params.randomSource = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
                ? crypto.randomUUID()
                : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
        }

        SimilarityScorer.preload();

        const data = await Fetcher.fetchJSON('./resources/data/' + this.params.subject.file) as ColloquiumFile;
        this.isBiletMode = this.params.contentType === 'bilets' || this.params.contentType === 'runtime';
        this.isExamMode = this.params.testType === 'exam';

        const questionsMap = new Map<number, ColloquiumQuestion>();
        data.Questions.forEach(q => questionsMap.set(q.Id, q));

        if (this.params.contentType === 'runtime') {
            const BILET_SIZE = 5;
            let allQuestions = [...data.Questions];
            if (!this.params.noShuffle) {
                allQuestions = SeededShuffle.shuffle(allQuestions, this.params.randomSource);
            }

            let bilets: DisplayBilet[] = [];
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
        } else if (this.isBiletMode && data.Bilets) {
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
        } else {
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

    protected async postLoad(holder: TemplateHolder): Promise<void> {
        const restartContainer = this['restartContainer'] as HTMLElement | undefined;
        if (restartContainer) restartContainer.style.display = 'none';

        const finishContainer = this['finishExamContainer'] as HTMLElement | undefined;
        if (finishContainer) {
            finishContainer.style.display = this.isExamMode ? 'block' : 'none';
        }

        // In exam mode: hide per-bilet confirm buttons
        if (this.isExamMode) {
            this.bilets.forEach((_, bidx) => {
                const confirmBtn = this['confirm_' + bidx] as HTMLElement;
                if (confirmBtn) confirmBtn.style.display = 'none';
            });
        }
    }

    public revealAnswer(biletIdx: number, questionIdx: number): void {
        const answerBlock = this['answer_' + biletIdx + '_' + questionIdx] as HTMLElement;
        if (answerBlock) answerBlock.style.display = 'block';
        const ta = this['ta_' + biletIdx + '_' + questionIdx] as ReTextArea;
        const userText = ta?.Value?.value ?? '';
        const userAnswerEl = this['useranswer_' + biletIdx + '_' + questionIdx] as HTMLElement;
        if (userAnswerEl) userAnswerEl.textContent = userText.trim() || '(нет ответа)';
        const inputRow = this['inputrow_' + biletIdx + '_' + questionIdx] as HTMLElement;
        if (inputRow) inputRow.style.display = 'none';
        if (ta) ta.setAttribute('disabled', '');
    }

    public revealQuestionAnswer(questionIdx: number): void {
        const answerBlock = this['qanswer_' + questionIdx] as HTMLElement;
        if (answerBlock) answerBlock.style.display = 'block';
        const ta = this['qta_' + questionIdx] as ReTextArea;
        const userText = ta?.Value?.value ?? '';
        const userAnswerEl = this['quseranswer_' + questionIdx] as HTMLElement;
        if (userAnswerEl) userAnswerEl.textContent = userText.trim() || '(нет ответа)';
        const inputRow = this['qinputrow_' + questionIdx] as HTMLElement;
        if (inputRow) inputRow.style.display = 'none';
        if (ta) ta.setAttribute('disabled', '');
    }

    private async scoreAnswer(userText: string, answers: string[], keywords: string[]): Promise<ScoreResult> {
        return SimilarityScorer.score(userText, answers, keywords);
    }

    private showScoreResult(scoreEl: HTMLElement, lengthEl: HTMLElement | undefined, result: ScoreResult): void {
        scoreEl.style.display = 'inline-flex';
        scoreEl.textContent = result.score + '%';
        if (result.score >= 80) scoreEl.setAttribute('color', 'success');
        else if (result.score >= 50) scoreEl.setAttribute('color', 'warning');
        else scoreEl.setAttribute('color', 'error');

        if (lengthEl) {
            if (result.lengthMismatch) {
                lengthEl.style.display = 'block';
                const pct = Math.round(result.lengthRatio * 100);
                lengthEl.textContent = `⚠ Размер ответа недостаточен (${pct}% от эталона, минимум 70%)`;
            } else {
                lengthEl.style.display = 'none';
            }
        }
    }

    public async submitBiletQuestion(biletIdx: number, questionIdx: number): Promise<void> {
        const bilet = this.bilets[biletIdx];
        if (!bilet) return;
        const question = bilet.questions[questionIdx];
        if (!question || question.status !== AnswerStatus.UNANSWERED) return;

        const submitBtn = this['submit_' + biletIdx + '_' + questionIdx] as HTMLElement;
        const skipBtn = this['skip_' + biletIdx + '_' + questionIdx] as HTMLElement;
        if (submitBtn) submitBtn.setAttribute('disabled', '');
        if (skipBtn) skipBtn.setAttribute('disabled', '');

        const ta = this['ta_' + biletIdx + '_' + questionIdx] as ReTextArea;
        const userText = ta?.Value?.value ?? '';
        const result = await this.scoreAnswer(userText, question.Answers, question.Keywords);
        question.status = result.score >= 50 ? AnswerStatus.SUCCESS : AnswerStatus.WRONG;
        question.score = result.score;

        this.revealAnswer(biletIdx, questionIdx);

        const scoreEl = this['score_' + biletIdx + '_' + questionIdx] as HTMLElement;
        const lengthEl = this['lenwarning_' + biletIdx + '_' + questionIdx] as HTMLElement | undefined;
        if (scoreEl) {
            this.showScoreResult(scoreEl, lengthEl, result);
        }
    }

    public skipBiletQuestion(biletIdx: number, questionIdx: number): void {
        const bilet = this.bilets[biletIdx];
        if (!bilet) return;
        const question = bilet.questions[questionIdx];
        if (!question || question.status !== AnswerStatus.UNANSWERED) return;

        question.status = AnswerStatus.WRONG;
        question.score = 0;
        this.revealAnswer(biletIdx, questionIdx);
    }

    public async submitQuestion(questionIdx: number): Promise<void> {
        const question = this.questions[questionIdx];
        if (!question || question.status !== AnswerStatus.UNANSWERED) return;

        const submitBtn = this['qsubmit_' + questionIdx] as HTMLElement;
        const skipBtn = this['qskip_' + questionIdx] as HTMLElement;
        if (submitBtn) submitBtn.setAttribute('disabled', '');
        if (skipBtn) skipBtn.setAttribute('disabled', '');

        const ta = this['qta_' + questionIdx] as ReTextArea;
        const userText = ta?.Value?.value ?? '';
        const result = await this.scoreAnswer(userText, question.Answers, question.Keywords);
        question.status = result.score >= 50 ? AnswerStatus.SUCCESS : AnswerStatus.WRONG;
        question.score = result.score;

        this.revealQuestionAnswer(questionIdx);

        const scoreEl = this['qscore_' + questionIdx] as HTMLElement;
        const lengthEl = this['qlenwarning_' + questionIdx] as HTMLElement | undefined;
        if (scoreEl) {
            this.showScoreResult(scoreEl, lengthEl, result);
        }
    }

    public skipQuestion(questionIdx: number): void {
        const question = this.questions[questionIdx];
        if (!question || question.status !== AnswerStatus.UNANSWERED) return;

        question.status = AnswerStatus.WRONG;
        question.score = 0;
        this.revealQuestionAnswer(questionIdx);
    }

    public async confirmBilet(biletIdx: number): Promise<void> {
        const bilet = this.bilets[biletIdx];
        if (!bilet) return;

        const confirmBtn = this['confirm_' + biletIdx] as HTMLElement;
        if (confirmBtn) confirmBtn.setAttribute('disabled', 'true');

        // Score unanswered questions via NLP, skip ones with no text
        for (let qIdx = 0; qIdx < bilet.questions.length; qIdx++) {
            const q = bilet.questions[qIdx];
            let result: ScoreResult = { score: 0, lengthMismatch: true, lengthRatio: 0 };
            if (q.status === AnswerStatus.UNANSWERED) {
                const ta = this['ta_' + biletIdx + '_' + qIdx] as ReTextArea;
                const userText = ta?.Value?.value ?? '';
                if (userText.trim().length > 0) {
                    result = await this.scoreAnswer(userText, q.Answers, q.Keywords);
                    q.status = result.score >= 50 ? AnswerStatus.SUCCESS : AnswerStatus.WRONG;
                    q.score = result.score;
                } else {
                    q.status = AnswerStatus.WRONG;
                    q.score = 0;
                }
            }
            this.revealAnswer(biletIdx, qIdx);

            const scoreEl = this['score_' + biletIdx + '_' + qIdx] as HTMLElement;
            const lengthEl = this['lenwarning_' + biletIdx + '_' + qIdx] as HTMLElement | undefined;
            if (scoreEl && q.score !== undefined) {
                this.showScoreResult(scoreEl, lengthEl, result);
            }
        }

        const totalScore = bilet.questions.reduce((sum, q) => sum + (q.score ?? 0), 0);
        const accuracy = bilet.questions.length > 0
            ? Math.round(totalScore / bilet.questions.length)
            : 0;

        const accuracyEl = this['accuracy_' + biletIdx] as HTMLElement;
        if (accuracyEl) {
            accuracyEl.style.display = 'inline-flex';
            accuracyEl.textContent = accuracy + '%';
            if (accuracy >= 80) accuracyEl.setAttribute('color', 'success');
            else if (accuracy >= 50) accuracyEl.setAttribute('color', 'warning');
            else accuracyEl.setAttribute('color', 'error');
        }

    }

    public finishExam(): void {
        (this['confirmPopup'] as PopUp).open();
    }

    public cancelFinish(): void {
        (this['confirmPopup'] as PopUp).close();
    }

    public async confirmFinish(): Promise<void> {
        (this['confirmPopup'] as PopUp).close();

        let totalScore = 0;
        let totalItems = 0;

        if (this.isBiletMode) {
            for (let bidx = 0; bidx < this.bilets.length; bidx++) {
                const bilet = this.bilets[bidx];
                for (let qidx = 0; qidx < bilet.questions.length; qidx++) {
                    const q = bilet.questions[qidx];
                    let result: ScoreResult = { score: q.score, lengthMismatch: false, lengthRatio: 1 };
                    if (q.status === AnswerStatus.UNANSWERED) {
                        const ta = this['ta_' + bidx + '_' + qidx] as ReTextArea;
                        const userText = ta?.Value?.value ?? '';
                        if (userText.trim().length > 0) {
                            result = await this.scoreAnswer(userText, q.Answers, q.Keywords);
                            q.status = result.score >= 50 ? AnswerStatus.SUCCESS : AnswerStatus.WRONG;
                            q.score = result.score;
                        } else {
                            q.status = AnswerStatus.WRONG;
                            q.score = 0;
                            result = { score: 0, lengthMismatch: true, lengthRatio: 0 };
                        }
                    }
                    this.revealAnswer(bidx, qidx);

                    const scoreEl = this['score_' + bidx + '_' + qidx] as HTMLElement;
                    const lengthEl = this['lenwarning_' + bidx + '_' + qidx] as HTMLElement | undefined;
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

                const accuracyEl = this['accuracy_' + bidx] as HTMLElement;
                if (accuracyEl) {
                    accuracyEl.style.display = 'inline-flex';
                    accuracyEl.textContent = accuracy + '%';
                    if (accuracy >= 80) accuracyEl.setAttribute('color', 'success');
                    else if (accuracy >= 50) accuracyEl.setAttribute('color', 'warning');
                    else accuracyEl.setAttribute('color', 'error');
                }

                const confirmBtn = this['confirm_' + bidx] as HTMLElement;
                if (confirmBtn) confirmBtn.setAttribute('disabled', 'true');
            }
        } else {
            for (let qidx = 0; qidx < this.questions.length; qidx++) {
                const q = this.questions[qidx];
                let result: ScoreResult = { score: q.score, lengthMismatch: false, lengthRatio: 1 };
                if (q.status === AnswerStatus.UNANSWERED) {
                    const ta = this['qta_' + qidx] as ReTextArea;
                    const userText = ta?.Value?.value ?? '';
                    if (userText.trim().length > 0) {
                        result = await this.scoreAnswer(userText, q.Answers, q.Keywords);
                        q.status = result.score >= 50 ? AnswerStatus.SUCCESS : AnswerStatus.WRONG;
                        q.score = result.score;
                    } else {
                        q.status = AnswerStatus.WRONG;
                        q.score = 0;
                        result = { score: 0, lengthMismatch: true, lengthRatio: 0 };
                    }
                }
                this.revealQuestionAnswer(qidx);

                const scoreEl = this['qscore_' + qidx] as HTMLElement;
                const lengthEl = this['qlenwarning_' + qidx] as HTMLElement | undefined;
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

        (this['resultCorrect'] as HTMLElement).textContent = String(correct);
        (this['resultWrong'] as HTMLElement).textContent = String(wrong);
        (this['resultAccuracy'] as HTMLElement).textContent = overallAccuracy + '%';

        (this['resultPopup'] as PopUp).open();

        const finishContainer = this['finishExamContainer'] as HTMLElement | undefined;
        if (finishContainer) finishContainer.style.display = 'none';
    }

    public closeResult(): void {
        (this['resultPopup'] as PopUp).close();
        const restartContainer = this['restartContainer'] as HTMLElement | undefined;
        if (restartContainer) restartContainer.style.display = 'block';
    }

    private regenerateShuffle(): void {
        const newSeed = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);

        this.params.randomSource = newSeed;
        const paramsStr = encodeURIComponent(JSON.stringify(this.params));
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/colloquim/actual?params=' + paramsStr)), true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

enum AnswerStatus {
    SUCCESS = "success",
    WRONG = "wrong",
    UNANSWERED = "unanswered"
}

class DisplayQuestion {
    public Id: number;
    public Title: string;
    public Answers: string[];
    public Keywords: string[];
    public localIdx: number;
    public status: AnswerStatus = AnswerStatus.UNANSWERED;
    public score: number = 0;

    constructor(data: ColloquiumQuestion, localIdx: number) {
        this.Id = data.Id;
        this.Title = data.Title;
        this.Answers = data.Answers ?? [];
        this.Keywords = data.Keywords ?? [];
        this.localIdx = localIdx;
    }
}

class DisplayBilet {
    public Id: number;
    public Title: string;
    public questions: DisplayQuestion[];
    public localIdx: number;

    constructor(id: number, title: string | undefined, questions: DisplayQuestion[], localIdx: number) {
        this.Id = id;
        this.Title = title ?? 'Билет ' + id;
        this.questions = questions;
        this.localIdx = localIdx;
    }
}
