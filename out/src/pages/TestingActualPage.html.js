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
let TestingActualPage = class TestingActualPage extends Page {
    params;
    questions;
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
        this.questions.forEach(q => q.shuffleAnswers(this.params.randomSource));
        return Promise.resolve();
    }
};
TestingActualPage = __decorate([
    RePage("./src/pages/TestingActualPage.phtml", "./src/pages/TestingActualPage.html.css", "./src/pages/TestingActualPage.html.ts", AccessType.BOTH, "/testing/actual"),
    __metadata("design:paramtypes", [String])
], TestingActualPage);
export default TestingActualPage;
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