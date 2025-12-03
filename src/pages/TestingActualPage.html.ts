import { AccessType, Fetcher, IElementHolder, Page, RePage } from "@Purper";
import { Subject } from "./TestingPage.html";
import QuestionParser, { Question } from "../../tri/QuestionParser.js";
import SeededShuffle from "../lib/SeededShuffle.js";

@RePage(
    "./src/pages/TestingActualPage.phtml",
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
    public constructor(params?: string) {
        super();
        this.params = JSON.parse(decodeURIComponent(params));
    }
    protected async preInit(): Promise<void> {
        const jj = await Fetcher.fetchJSON('../../resources/data' + '/' + this.params.subject.file);
        var i = 1;
        this.questions = (jj as QuestionParser).Questions
            .map((q, idx) => new TemporaryQuestion(q, idx + 1, i++));
        this.questions = SeededShuffle.shuffle(this.questions, this.params.randomSource);
        if (this.params.limits && this.params.limits > 0) {
            this.questions = this.questions.slice(0, Number(this.params.limits));
        }
        this.questions.forEach(q => q.shuffleAnswers(this.params.randomSource));
        return Promise.resolve();
    }
}

class TemporaryQuestion implements Question {
    public Id: number;
    public RDd: number;
    public Title: string;
    public Answers: string[];

    public localId: number;

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
