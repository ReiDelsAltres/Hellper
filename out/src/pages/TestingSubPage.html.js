var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Fetcher, Page, RePage } from "@Purper";
let TestingSubPage = class TestingSubPage extends Page {
    subject;
    testModes = [
        new TestMode("Быстрый тест", "Ты школьник", 5, "success"),
        new TestMode("Экзамен", "Ты студент", 25, "warning"),
        new TestMode("Мазохизм", "Ты адекватный?", null, "error"),
    ];
    activeMode = this.testModes[1];
    activeTestType = "main";
    inputTestType;
    inputStartFrom;
    inputQuestionCount;
    inputEndAt;
    totalQuestions = 0;
    modeElements;
    constructor(subject) {
        super();
        this.subject = JSON.parse(decodeURIComponent(subject));
    }
    getAllParamsForTesting() {
        const startFrom = this.inputStartFrom?.getValue() ? parseInt(this.inputStartFrom.getValue(), 10) : null;
        const questionCount = this.inputQuestionCount?.getValue() ? parseInt(this.inputQuestionCount.getValue(), 10) : null;
        const endAt = this.inputEndAt?.getValue() ? parseInt(this.inputEndAt.getValue(), 10) : null;
        const params = {
            subject: this.subject,
            limits: questionCount ?? this.activeMode.numQuestions,
            testType: this.activeTestType,
            randomSource: null,
            startFrom: startFrom,
            endAt: endAt
        };
        return "/testing/actual?params=" + encodeURIComponent(JSON.stringify(params));
    }
    async preLoad(holder) {
        var allConn = holder.element.querySelectorAll('.mode-item');
        this.modeElements = allConn;
        // Fetch questions count for the massochism mode and update UI immediately
        // We await here so the initial render will show the correct number right after preLoad resolves.
        try {
            if (this.subject && this.subject.file) {
                const data = await Fetcher.fetchJSON('./resources/data' + '/' + this.subject.file);
                if (data && Array.isArray(data.Questions)) {
                    this.totalQuestions = data.Questions.length;
                    this.testModes[2].numQuestions = this.totalQuestions;
                    // Update max values for inputs
                    if (this.inputStartFrom) {
                        this.inputStartFrom.setAttribute('max', String(this.totalQuestions));
                        this.inputStartFrom.setAttribute('placeholder', '1');
                    }
                    if (this.inputQuestionCount) {
                        this.inputQuestionCount.setAttribute('max', String(this.totalQuestions));
                        this.inputQuestionCount.setAttribute('placeholder', String(this.totalQuestions));
                    }
                    if (this.inputEndAt) {
                        this.inputEndAt.setAttribute('max', String(this.totalQuestions));
                        this.inputEndAt.setAttribute('placeholder', String(this.totalQuestions));
                    }
                    // Update UI chip for the masochism mode if present in DOM
                    const masEl = holder.element.querySelector(`.mode-item[data-mode="${this.testModes[2].name}"]`);
                    if (masEl) {
                        const chip = masEl.querySelector('.mode-count');
                        if (chip)
                            chip.textContent = String(this.testModes[2].numQuestions ?? '');
                    }
                }
            }
        }
        catch (e) {
            // non-fatal — just log
            console.warn('Failed to load questions for subject:', e);
        }
        allConn.forEach((item) => {
            item.addEventListener('click', async (event) => {
                // Use currentTarget because event.target can be a child node (span, chip, svg)
                // which would not carry the data-mode attribute — causing find() to return undefined.
                const clickedEl = (event.currentTarget || event.target);
                const modeName = this.getModeNameFromEvent(event, clickedEl);
                if (!modeName) {
                    // nothing matched — ignore the click
                    return;
                }
                const newMode = this.testModes.find(mode => mode.name === modeName);
                if (!newMode) {
                    // mode not found (shouldn't happen) — ignore safely
                    return;
                }
                this.activeMode = newMode;
                // Update question count placeholder based on selected mode
                if (this.inputQuestionCount) {
                    this.inputQuestionCount.setValue('');
                    this.inputQuestionCount.setAttribute('placeholder', String(this.activeMode.numQuestions ?? this.totalQuestions));
                }
                // apply color and variants to mode-items only when we have a valid activeMode
                allConn.forEach((el) => {
                    // leave settings button untouched
                    if (this.activeMode) {
                        el.setAttribute('color', this.activeMode.colorP);
                    }
                    // set clicked one to filled, others to outlined
                    const elMode = el.getAttribute('data-mode');
                    if (el.classList.contains('settings-item'))
                        return;
                    if (elMode === this.activeMode.name) {
                        el.setAttribute('variant', 'filled');
                    }
                    else {
                        el.setAttribute('variant', 'outlined');
                    }
                    document.querySelector('#start-test')?.setAttribute('href', this.getAllParamsForTesting());
                });
            });
            //this.selectMode(target, target.getAttribute('data-mode')!);
        });
        // Ensure initial colors and variants reflect currently active mode
        const initialMode = this.activeMode ?? this.testModes[0];
        if (initialMode) {
            // Set initial question count placeholder
            if (this.inputQuestionCount) {
                this.inputQuestionCount.setAttribute('placeholder', String(initialMode.numQuestions ?? this.totalQuestions));
            }
            allConn.forEach((el) => {
                // leave settings button untouched
                el.setAttribute('color', initialMode.colorP);
                if (el.classList.contains('settings-item'))
                    return;
                // active mode -> filled, others -> outlined
                const elMode = el.getAttribute('data-mode');
                if (elMode === initialMode.name) {
                    el.setAttribute('variant', 'filled');
                }
                else {
                    el.setAttribute('variant', 'outlined');
                }
            });
        }
        document.getElementById('start-test')?.setAttribute('href', this.getAllParamsForTesting());
        return Promise.resolve();
    }
    async postLoad(holder) {
        document.getElementById('start-test')?.setAttribute('href', this.getAllParamsForTesting());
        // Listen to test type changes from button group
        if (this.inputTestType) {
            this.inputTestType.addEventListener('selection-change', (ev) => {
                const detail = ev.detail;
                if (detail && detail.value) {
                    this.activeTestType = detail.value;
                    document.getElementById('start-test')?.setAttribute('href', this.getAllParamsForTesting());
                }
            });
        }
        // Listen to input changes for question range
        const updateHref = () => {
            document.getElementById('start-test')?.setAttribute('href', this.getAllParamsForTesting());
        };
        this.inputStartFrom?.addEventListener('input-change', updateHref);
        this.inputQuestionCount?.addEventListener('input-change', (ev) => {
            updateHref();
            const detail = ev.detail;
            const value = detail?.value;
            // If user manually entered a value, deselect all modes and set info color
            if (value && value.length > 0) {
                this.modeElements?.forEach((el) => {
                    if (el.classList.contains('settings-item'))
                        return;
                    el.setAttribute('color', 'info');
                    el.setAttribute('variant', 'outlined');
                });
            }
        });
        this.inputEndAt?.addEventListener('input-change', updateHref);
        // Toggle optionBlock open/close when Options button is clicked
        const settingsBtn = holder.element.querySelector('.settings-item');
        const optionBlock = holder.element.querySelector('.optionBlock');
        if (settingsBtn && optionBlock) {
            const closeOnOutside = (ev) => {
                if (!optionBlock.contains(ev.target) && !settingsBtn.contains(ev.target)) {
                    optionBlock.classList.remove('open');
                    settingsBtn.removeAttribute('aria-pressed');
                    settingsBtn.removeAttribute('aria-expanded');
                    document.removeEventListener('click', closeOnOutside);
                }
            };
            settingsBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                const isOpen = optionBlock.classList.toggle('open');
                if (isOpen) {
                    settingsBtn.setAttribute('aria-pressed', 'true');
                    settingsBtn.setAttribute('aria-expanded', 'true');
                    // close when clicking outside
                    setTimeout(() => document.addEventListener('click', closeOnOutside));
                }
                else {
                    settingsBtn.removeAttribute('aria-pressed');
                    settingsBtn.removeAttribute('aria-expanded');
                    document.removeEventListener('click', closeOnOutside);
                }
            });
        }
        return Promise.resolve();
    }
    /**
     * Extracts data-mode from an event safely.
     * Uses currentTarget first (listener host), then falls back to event.target.closest('.mode-item').
     * This avoids issues when clicking child nodes inside the button which would otherwise
     * produce null on getAttribute('data-mode') and lead to activeMode undefined.
     */
    getModeNameFromEvent(event, currentTarget) {
        const nameFromCurrent = currentTarget?.getAttribute('data-mode') ?? null;
        if (nameFromCurrent)
            return nameFromCurrent;
        const t = event.target;
        const closest = t?.closest?.('.mode-item');
        return closest?.getAttribute('data-mode') ?? null;
    }
};
TestingSubPage = __decorate([
    RePage({
        markupURL: "./src/pages/TestingSubPage.phtml",
        cssURL: "./src/pages/TestingSubPage.html.css",
        jsURL: "./src/pages/TestingSubPage.html.ts",
        class: TestingSubPage,
    }, "/testing/sub"),
    __metadata("design:paramtypes", [String])
], TestingSubPage);
export default TestingSubPage;
class TestMode {
    name;
    description;
    numQuestions;
    colorP;
    constructor(name, description, numQuestions, colorP = "primary") {
        this.name = name;
        this.description = description;
        this.numQuestions = numQuestions;
        this.colorP = colorP;
    }
}
//# sourceMappingURL=TestingSubPage.html.js.map