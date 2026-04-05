var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Fetcher, ModuleManager, Page, RePage, Router, Observable } from "@Purper";
let TestingSubPage = class TestingSubPage extends Page {
    get Debug() { return ModuleManager.isActive("Debug"); }
    subject;
    fetchedData;
    testModes = [
        { signature: "fast", name: "Быстрый тест", description: "Ты школьник", numQuestions: new Observable(5), colorP: "success" },
        { signature: "normal", name: "Экзамен", description: "Ты студент", numQuestions: new Observable(25), colorP: "warning" },
        { signature: "hard", name: "Мазохизм", description: "Ты адекватный?", numQuestions: new Observable(0), colorP: "error" },
    ];
    testModesGroup;
    modeSettingsButton;
    optionBlock;
    inputTestType;
    inputMin;
    inputVal;
    inputMax;
    inputNoShuffle;
    noShuffle = false;
    modeElements;
    startTestButton;
    cacheIndicator;
    constructor(subject) {
        super();
        this.subject = JSON.parse(decodeURIComponent(subject));
    }
    dataUrl = '';
    async preLoad(holder) {
        this.dataUrl = './resources/data/' + this.subject.file;
        const result = await Fetcher.fetchJSON(this.dataUrl);
        this.fetchedData = result;
        this.testModes[2].numQuestions.setObject(result.Questions.length);
    }
    updateCacheIndicator(url, data) {
        if (!this.cacheIndicator)
            return;
        this.cacheIndicator.loaded.setObject(true);
        this.cacheIndicator.fileName.setObject(url);
        const jsonStr = JSON.stringify(data);
        const sizeBytes = new Blob([jsonStr]).size;
        this.cacheIndicator.fileSize.setObject(sizeBytes);
        const resolvedUrl = Fetcher.resolveUrl(url);
        const entries = performance.getEntriesByName(resolvedUrl, 'resource');
        const entry = entries.length > 0 ? entries[entries.length - 1] : null;
        if (entry) {
            if (entry.transferSize === 0) {
                this.cacheIndicator.source.setObject('cache');
                this.cacheIndicator.networkCost.setObject(0);
            }
            else {
                this.cacheIndicator.source.setObject('network');
                this.cacheIndicator.networkCost.setObject(entry.transferSize);
            }
        }
        else {
            this.cacheIndicator.source.setObject('unknown');
        }
    }
    async postLoad(holder) {
        this.updateCacheIndicator(this.dataUrl, this.fetchedData);
        if (this.testModesGroup?.buttonMap)
            this.updateTestModeGroup(this.testModesGroup.buttonMap);
        if (this.inputTestType?.buttonMap)
            this.updateTestTypeChange(this.inputTestType.buttonMap);
        const totalQuestions = this.testModes[2].numQuestions.getObject() || 300;
        // Set initial bounds for range inputs
        this.inputMin?.Min.setObject(1);
        this.inputMin?.Max.setObject(totalQuestions);
        this.inputMax?.Min.setObject(1);
        this.inputMax?.Max.setObject(totalQuestions);
        this.inputMin?.Value.subscribe((key, old, value) => {
            const minVal = parseInt(value) || 1;
            this.inputMax?.Min.setObject(minVal);
        });
        this.inputMax?.Value.subscribe((key, old, value) => {
            const maxVal = parseInt(value) || totalQuestions;
            this.inputMin?.Max.setObject(maxVal);
        });
    }
    onSelectionChange(event) {
        this.updateTestModeGroup(event.detail.buttons);
    }
    onTestTypeChange(event) {
        this.updateTestTypeChange(event.detail.buttons);
    }
    updateTestTypeChange(buttons) {
        buttons.forEach((isSelected, btn) => {
            if (isSelected) {
                btn.Variant.setObject('filled');
            }
            else {
                btn.Variant.setObject('outlined');
            }
        });
    }
    updateTestModeGroup(buttons) {
        const activeMode = this.testModes.find(mode => mode.signature === this.testModesGroup?.Value.value);
        const color = activeMode?.colorP || 'primary';
        buttons.forEach((selected, btn) => {
            btn.Color.setObject(color);
            if (selected) {
                btn.Variant.setObject('filled');
            }
            else {
                btn.Variant.setObject('outlined');
            }
        });
        this.modeSettingsButton?.Color.setObject(color);
        this.optionBlock?.Color.setObject(color);
        this.inputVal?.Value.setObject(activeMode?.numQuestions.getObject()?.toString() ?? '');
    }
    downloadQuestions() {
        const questions = this.fetchedData.Questions;
        const lines = [];
        for (const q of questions) {
            lines.push(`${q.Id}. ${q.Title}`);
            q.Answers.forEach((ans, i) => {
                const letter = String.fromCharCode(65 + i);
                const mark = i === 0 ? ' \u2713' : '';
                lines.push(`   ${letter}. ${ans}${mark}`);
            });
            lines.push('');
        }
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.subject.name}_questions.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
    startTest() {
        const activeMode = this.testModes.find(mode => mode.signature === this.testModesGroup?.Value.value);
        const limits = parseInt(this.inputVal?.Value.value) || activeMode?.numQuestions.getObject() || 25;
        const startFrom = parseInt(this.inputMin?.Value.value) - 1 || 0;
        const endAt = parseInt(this.inputMax?.Value.value) || undefined;
        const testType = this.inputTestType?.Value.value || 'main';
        const noShuffle = this.inputNoShuffle?.hasAttribute('checked') ?? false;
        const params = {
            subject: this.subject,
            type: activeMode?.signature ?? 'normal',
            limits,
            startFrom,
            endAt,
            randomSource: null,
            noShuffle,
            testType
        };
        const paramsStr = encodeURIComponent(JSON.stringify(params));
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/testing/actual?params=' + paramsStr)), true);
    }
};
TestingSubPage = __decorate([
    RePage({
        markupURL: "./src/pages/TestingSubPage.hmle",
        cssURL: "./src/pages/TestingSubPage.html.css",
    }, "/testing/sub"),
    __metadata("design:paramtypes", [String])
], TestingSubPage);
export default TestingSubPage;
//# sourceMappingURL=TestingSubPage.html.js.map