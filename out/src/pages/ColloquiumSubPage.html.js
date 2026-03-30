var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ColloquiumSubPage_1;
import { Fetcher, Page, RePage, Router, Observable } from "@Purper";
let ColloquiumSubPage = class ColloquiumSubPage extends Page {
    static { ColloquiumSubPage_1 = this; }
    subject;
    totalQuestions = 0;
    totalBilets = 0;
    hasBilets = false;
    static RUNTIME_BILET_SIZE = 5;
    testModes = [
        { signature: "fast", name: "Быстрый", description: "Быстрая проверка", numItems: new Observable(5), colorP: "success" },
        { signature: "normal", name: "Обычный", description: "Стандартный тест", numItems: new Observable(25), colorP: "warning" },
        { signature: "hard", name: "Всё", description: "Все вопросы", numItems: new Observable(0), colorP: "error" },
    ];
    testModesGroup;
    modeSettingsButton;
    optionBlock;
    inputTestType;
    inputContentType;
    biletsButton;
    inputVal;
    inputNoShuffle;
    constructor(subject) {
        super();
        this.subject = JSON.parse(decodeURIComponent(subject));
    }
    async preLoad(holder) {
        const result = await Fetcher.fetchJSON('./resources/data/' + this.subject.file);
        this.totalQuestions = result.Questions.length;
        this.totalBilets = result.Bilets?.length ?? 0;
        this.hasBilets = (result.Bilets?.length ?? 0) > 0;
        this.testModes[2].numItems.setObject(this.totalQuestions);
    }
    async postLoad(holder) {
        this.updateTestModeGroup(this.testModesGroup?.buttonMap);
        this.updateTestTypeChange(this.inputTestType?.buttonMap);
        if (this.inputContentType) {
            this.updateContentTypeChange(this.inputContentType.buttonMap);
        }
        if (this.biletsButton && !this.hasBilets) {
            this.biletsButton.Disabled.setObject(true);
        }
    }
    onSelectionChange(event) {
        this.updateTestModeGroup(event.detail.buttons);
    }
    onTestTypeChange(event) {
        this.updateTestTypeChange(event.detail.buttons);
    }
    onContentTypeChange(event) {
        this.updateContentTypeChange(event.detail.buttons);
    }
    updateTestTypeChange(buttons) {
        buttons.forEach((isSelected, btn) => {
            btn.Variant.setObject(isSelected ? 'filled' : 'outlined');
        });
    }
    updateContentTypeChange(buttons) {
        buttons.forEach((isSelected, btn) => {
            btn.Variant.setObject(isSelected ? 'filled' : 'outlined');
        });
        this.updateItemCounts();
        const activeMode = this.testModes.find(mode => mode.signature === this.testModesGroup?.Value.value);
        this.inputVal?.Value.setObject(activeMode?.numItems.getObject()?.toString());
    }
    updateItemCounts() {
        const contentType = this.inputContentType?.Value.value || 'questions';
        if (contentType === 'bilets') {
            this.testModes[0].numItems.setObject(Math.min(1, this.totalBilets));
            this.testModes[1].numItems.setObject(Math.min(5, this.totalBilets));
            this.testModes[2].numItems.setObject(this.totalBilets);
        }
        else if (contentType === 'runtime') {
            const totalRuntimeBilets = Math.ceil(this.totalQuestions / ColloquiumSubPage_1.RUNTIME_BILET_SIZE);
            this.testModes[0].numItems.setObject(Math.min(1, totalRuntimeBilets));
            this.testModes[1].numItems.setObject(Math.min(5, totalRuntimeBilets));
            this.testModes[2].numItems.setObject(totalRuntimeBilets);
        }
        else {
            this.testModes[0].numItems.setObject(Math.min(5, this.totalQuestions));
            this.testModes[1].numItems.setObject(Math.min(25, this.totalQuestions));
            this.testModes[2].numItems.setObject(this.totalQuestions);
        }
    }
    updateTestModeGroup(buttons) {
        const activeMode = this.testModes.find(mode => mode.signature === this.testModesGroup?.Value.value);
        const color = activeMode?.colorP || 'primary';
        buttons.forEach((selected, btn) => {
            btn.Color.setObject(color);
            btn.Variant.setObject(selected ? 'filled' : 'outlined');
        });
        this.modeSettingsButton?.Color.setObject(color);
        this.optionBlock?.Color.setObject(color);
        this.inputVal?.Value.setObject(activeMode?.numItems.getObject()?.toString());
    }
    startTest() {
        const activeMode = this.testModes.find(mode => mode.signature === this.testModesGroup?.Value.value);
        const contentType = this.inputContentType?.Value.value || 'questions';
        const limits = parseInt(this.inputVal?.Value.value) || activeMode?.numItems.getObject() || 25;
        const testType = this.inputTestType?.Value.value || 'main';
        const noShuffle = this.inputNoShuffle?.hasAttribute('checked') ?? false;
        const params = {
            subject: this.subject,
            type: activeMode?.signature ?? 'normal',
            contentType,
            limits,
            randomSource: null,
            noShuffle,
            testType
        };
        const paramsStr = encodeURIComponent(JSON.stringify(params));
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/colloquim/actual?params=' + paramsStr)), true);
    }
};
ColloquiumSubPage = ColloquiumSubPage_1 = __decorate([
    RePage({
        markupURL: "./src/pages/ColloquiumSubPage.hmle",
        cssURL: "./src/pages/ColloquiumSubPage.html.css",
    }, "/colloquim/sub"),
    __metadata("design:paramtypes", [String])
], ColloquiumSubPage);
export default ColloquiumSubPage;
//# sourceMappingURL=ColloquiumSubPage.html.js.map