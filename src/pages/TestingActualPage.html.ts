import { AccessType, Fetcher, IElementHolder, Page, RePage, Router } from "@Purper";
import { Subject } from "./TestingPage.html";
import QuestionParser, { Question } from "../../tri/QuestionParser.js";
import SeededShuffle from "../lib/SeededShuffle.js";
import { KatexUtils } from "../KatexUtils.js";
import PopUp from "../components/PopUp.html.js";

@RePage(
    "./src/pages/TestingActualPage.hmle",
    "./src/pages/TestingActualPage.html.css",
    "./src/pages/TestingActualPage.html.ts",
    AccessType.BOTH,
    "/testing/actual"
)
export default class TestingActualPage extends Page {
    private params: {
        subject: Subject,
        limits: number,
        randomSource: string
    };
    private questions: TemporaryQuestion[];
    private statuses: AnswerStatus[] = [];
    public constructor(params?: string) {
        super();
        this.params = JSON.parse(decodeURIComponent(params));
    }
    protected async preInit(): Promise<void> {
        const newSeed = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);

        this.params.randomSource = newSeed;
        const jj = await Fetcher.fetchJSON('../../resources/data' + '/' + this.params.subject.file);

        var i = 1;

        this.questions = (jj as QuestionParser).Questions
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

    protected async postLoad(holder: IElementHolder) {
        // Auto-render KaTeX formulas (if any) inside page content after render
        try {
            // KatexUtils.autoRender accepts an Element — holder.element may be a DocumentFragment
            const el = holder.element as unknown as HTMLElement;
            if (el) KatexUtils.autoRender(el);
        } catch (e) {
            // non-fatal — continue without breaking page
            console.warn('KaTeX auto-render failed', e);
        }

        // Update seed display (if present) so user can see the session UUID
        try {
            const seedEl = this['seedDisplay'] as HTMLElement | undefined;
            if (seedEl) seedEl.textContent = String(this.params.randomSource ?? '');
        } catch (_) { }
    }

    private resolveEnding() {
        if (this.statuses.some(s => s === AnswerStatus.UNANSWERED)) return;

        const correct = this.statuses.filter(s => s === AnswerStatus.SUCCESS).length;
        const wrong = this.statuses.filter(s => s === AnswerStatus.WRONG).length;
        const skip = this.statuses.filter(s => s === AnswerStatus.SKIP).length;

        // Update popup content
        (this['resultCorrect'] as HTMLElement).textContent = String(correct);
        (this['resultWrong'] as HTMLElement).textContent = String(wrong);
        (this['resultSkip'] as HTMLElement).textContent = String(skip);

        //25 => 24 * 2 - 1 = 47;
        if (this.questions.length === 25) {
            const score = (correct * 2) - wrong;
            (this['resultScore'] as HTMLElement).textContent = String(score);
            (this['resultScoreBlock'] as HTMLElement).style.display = 'block';
        }

        // Open result popup
        (this['resultPopup'] as PopUp).open();
    }

    private closeResult(): void {
        (this['resultPopup'] as PopUp).close();
    }

    private handleClick(event: Event, element: HTMLElement, 
        params: { qidx: number, aidx: number, c0: string, c1: string, c2: string }): void {
        
        const { qidx, aidx, c0, c1, c2 } = params;
        console.log('Clicked answer:', params);
        for (const c of [c0, c1, c2]) {
            const chip = this[c] as HTMLElement;
            chip.setAttribute("disabled", "true");
        }
        for (let i = 0; i < 6; i++) {
            const tt = this[qidx + "-" + i] as HTMLElement;
            tt.setAttribute("disabled", "true");
            if (tt === element) continue;
            
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

    // Regenerate a new randomSource and reload this page via SPA router (no full browser reload)
    private regenerateShuffle(): void {

        // Build new url keeping other params intact and trigger SPA navigation which reloads this page
        try {
            const paramsStr = encodeURIComponent(JSON.stringify(this.params));
            const url = new URL('/testing/actual?params=' + paramsStr, window.location.origin);
            Router.tryRouteTo(url, true);
        } catch (e) {
            // fallback: simple reload of current page
            window.location.href = window.location.pathname + '?params=' + encodeURIComponent(JSON.stringify(this.params));
        }
    }
}

enum AnswerStatus {
    SUCCESS = "success",
    WRONG = "wrong",
    SKIP = "skip",
    UNANSWERED = "unanswered"
}
class TemporaryQuestion implements Question {
    public Id: number;
    public RDd: number;
    public Title: string;
    public Answers: string[];

    public localId: number

    constructor(data: Question, fallbackId: number, localId: number) {
        this.Id = data.Id ?? fallbackId;
        this.RDd = data.RDd ?? 0;

        this.Title = data.Title;
        this.Answers = data.Answers;

        this.localId = localId;
    }

    public isCorrect(index: number): boolean {
        return index === this.RDd;
    }

    public shuffleAnswers(uuid: string): void {
        if (!uuid || this.Answers.length <= 1) return;

        const { shuffled, newIndexForOld } = SeededShuffle.shuffleWithMapping(this.Answers.slice(), uuid);
        const oldCorrect = this.RDd;
        this.Answers = shuffled;
        this.RDd = (newIndexForOld && typeof newIndexForOld[oldCorrect] === 'number') ? newIndexForOld[oldCorrect] : 0;
    }

    public toJSON(): Question {
        return { Id: this.Id, RDd: this.RDd, Title: this.Title, Answers: this.Answers.slice() };
    }

}
