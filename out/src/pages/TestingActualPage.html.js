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
import { KatexUtils } from "../KatexUtils.js";
let TestingActualPage = class TestingActualPage extends Page {
    params;
    questions;
    statuses = [];
    selectedAnswers = []; // Track selected answer index per question (for exam mode)
    isExamMode = false;
    constructor(params) {
        super();
        this.params = JSON.parse(decodeURIComponent(params));
    }
    async preInit() {
        if (this.params.randomSource === null) {
            const newSeed = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
                ? crypto.randomUUID()
                : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
            this.params.randomSource = newSeed;
        }
        const jj = await Fetcher.fetchJSON('./resources/data' + '/' + this.params.subject.file);
        var i = 1;
        this.questions = jj.Questions
            .slice(this.params.startFrom ?? 0, this.params.endAt ?? undefined)
            .map((q, idx) => new TemporaryQuestion(q, idx + 1, i++));
        if (!this.params.noShuffle)
            this.questions = SeededShuffle.shuffle(this.questions, this.params.randomSource);
        if (this.params.limits && this.params.limits > 0) {
            this.questions = this.questions.slice(0, Number(this.params.limits));
        }
        this.statuses = new Array(this.questions.length).fill(AnswerStatus.UNANSWERED);
        this.selectedAnswers = new Array(this.questions.length).fill(null);
        this.isExamMode = this.params.testType === 'exam';
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
        // Update seed display (if present) so user can see the session UUID
        try {
            const seedEl = this['seedDisplay'];
            if (seedEl)
                seedEl.textContent = String(this.params.randomSource ?? '');
        }
        catch (_) { }
        // Show/hide finish exam button based on mode
        const finishContainer = this['finishExamContainer'];
        if (finishContainer) {
            finishContainer.style.display = this.isExamMode ? 'block' : 'none';
        }
        // Hide restart button initially
        const restartContainer = this['restartContainer'];
        if (restartContainer) {
            restartContainer.style.display = 'none';
        }
        // Initialize masonry layout
        this.initMasonry();
    }
    masonryResizeObserver;
    initMasonry() {
        const container = document.querySelector('.questions-container');
        if (!container)
            return;
        const layoutMasonry = () => {
            const cards = Array.from(container.querySelectorAll('.question-card'));
            if (cards.length === 0)
                return;
            const containerWidth = container.clientWidth;
            const gap = 20;
            const minColumnWidth = 320;
            // Calculate number of columns based on container width
            let columns = Math.max(1, Math.floor((containerWidth + gap) / (minColumnWidth + gap)));
            // Limit columns based on screen size
            if (containerWidth < 600)
                columns = 1;
            else if (containerWidth < 900)
                columns = Math.min(columns, 2);
            else if (containerWidth < 1200)
                columns = Math.min(columns, 3);
            else if (containerWidth < 1600)
                columns = Math.min(columns, 4);
            else
                columns = Math.min(columns, 5);
            const columnWidth = (containerWidth - gap * (columns - 1)) / columns;
            const columnHeights = new Array(columns).fill(0);
            cards.forEach((card) => {
                // Find the shortest column
                const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
                // Position the card
                const x = shortestColumn * (columnWidth + gap);
                const y = columnHeights[shortestColumn];
                card.style.width = `${columnWidth}px`;
                card.style.transform = `translate(${x}px, ${y}px)`;
                // Update column height
                columnHeights[shortestColumn] += card.offsetHeight + gap;
            });
            // Set container height
            container.style.height = `${Math.max(...columnHeights) - gap}px`;
            container.classList.add('masonry-initialized');
        };
        // Initial layout after a small delay to ensure cards are rendered
        requestAnimationFrame(() => {
            layoutMasonry();
        });
        // Re-layout on resize
        this.masonryResizeObserver = new ResizeObserver(() => {
            layoutMasonry();
        });
        this.masonryResizeObserver.observe(container);
        // Also listen for window resize as backup
        window.addEventListener('resize', layoutMasonry);
    }
    resolveEnding(forceShow = false) {
        if (!forceShow && this.statuses.some(s => s === AnswerStatus.UNANSWERED))
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
        // Update christmas lights (rebuild ring and mark active lights)
        try {
            this.updateChristmasLights(correct);
        }
        catch (_) { }
        // Open result popup
        this['resultPopup'].open();
    }
    /**
     * Build a ring of lights around the tree with count equal to number of questions
     * and mark first `correct` lights as active (green). Caps total lights to avoid huge DOM.
     */
    updateChristmasLights(correct) {
        try {
            const svg = document.querySelector('.christmas-svg');
            if (!svg)
                return;
            const totalQuestions = (this.questions && this.questions.length) ? this.questions.length : 1;
            const MAX_LIGHTS = 120;
            const desiredLights = Math.max(1, Math.min(MAX_LIGHTS, totalQuestions));
            // Ensure lights group exists
            let lightsGroup = svg.querySelector('.lights');
            if (!lightsGroup) {
                lightsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                lightsGroup.setAttribute('class', 'lights');
                svg.appendChild(lightsGroup);
            }
            // If different count, rebuild as ring around tree center
            const existing = Array.from(lightsGroup.querySelectorAll('circle'));
            if (existing.length !== desiredLights) {
                lightsGroup.innerHTML = '';
                const centerX = 32;
                const centerY = 40;
                // radius grows slightly with more lights but limited
                const radius = 18 + Math.min(22, Math.floor(desiredLights / 6));
                const baseColors = ['#ffd54f', '#ff8a80', '#80deea', '#ffcc80', '#f48fb1'];
                for (let i = 0; i < desiredLights; i++) {
                    const angle = (i / desiredLights) * Math.PI * 2;
                    const jitter = (i % 3 === 0) ? 0.6 : 0; // small radial variation
                    const cx = centerX + (radius + jitter) * Math.cos(angle);
                    const cy = centerY + (radius + jitter) * Math.sin(angle);
                    const r = desiredLights > 80 ? 0.6 : desiredLights > 40 ? 1.0 : 1.6;
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('class', 'light l' + ((i % 5) + 1));
                    circle.setAttribute('cx', String(cx));
                    circle.setAttribute('cy', String(cy));
                    circle.setAttribute('r', String(r));
                    circle.setAttribute('fill', baseColors[i % baseColors.length]);
                    lightsGroup.appendChild(circle);
                }
            }
            const lights = Array.from(lightsGroup.querySelectorAll('.light'));
            const activeCount = Math.max(0, Math.min(lights.length, correct));
            lights.forEach((l, idx) => {
                const el = l;
                if (!el.getAttribute('data-orig-fill'))
                    el.setAttribute('data-orig-fill', el.getAttribute('fill') || '');
                if (idx < activeCount) {
                    el.setAttribute('fill', '#00e676');
                    el.classList.add('active');
                }
                else {
                    const orig = el.getAttribute('data-orig-fill') || '';
                    if (orig)
                        el.setAttribute('fill', orig);
                    el.classList.remove('active');
                }
            });
            const proportion = correct / Math.max(1, totalQuestions);
            const glowLevel = Math.max(0, Math.min(5, Math.round(proportion * 5)));
            for (let i = 0; i <= 5; i++)
                svg.classList.remove('glow-' + i);
            svg.classList.add('glow-' + glowLevel);
        }
        catch (e) {
            console.warn('updateChristmasLights failed', e);
        }
    }
    closeResult() {
        this['resultPopup'].close();
        // Show restart button after closing results
        const restartContainer = this['restartContainer'];
        if (restartContainer) {
            restartContainer.style.display = 'block';
        }
        // Hide finish exam button if it was visible
        const finishContainer = this['finishExamContainer'];
        if (finishContainer) {
            finishContainer.style.display = 'none';
        }
    }
    handleClick(event, element, params) {
        const { qidx, aidx, c0, c1, c2 } = params;
        console.log('Clicked answer:', params);
        const question = this.questions[qidx];
        if (this.isExamMode) {
            // Exam mode: just select the answer, don't reveal correctness
            // Remove 'selected' from all answers in this question
            for (let i = 0; i < question.Answers.length; i++) {
                const btn = this[qidx + "-" + i];
                if (btn) {
                    btn.removeAttribute('selected');
                }
            }
            // Mark clicked answer as selected
            element.setAttribute('selected', '');
            this.selectedAnswers[qidx] = aidx;
            // Update status silently (will be revealed later)
            if (aidx === question.RDd) {
                this.statuses[qidx] = AnswerStatus.SUCCESS;
            }
            else if (aidx === question.Answers.length - 1) {
                this.statuses[qidx] = AnswerStatus.SKIP;
            }
            else {
                this.statuses[qidx] = AnswerStatus.WRONG;
            }
        }
        else {
            // Normal mode: disable and show colors immediately
            for (const c of [c0, c1, c2]) {
                const chip = this[c];
                chip.setAttribute("disabled", "true");
            }
            for (let i = 0; i < 6; i++) {
                const tt = this[qidx + "-" + i];
                if (!tt)
                    continue;
                tt.setAttribute("disabled", "true");
                if (tt === element)
                    continue;
                if (i === question.RDd) {
                    tt.setAttribute('color', 'success');
                    tt.setAttribute("variant", "outlined");
                }
            }
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
    }
    /**
     * Показать popup подтверждения завершения экзамена
     */
    finishExam() {
        if (!this.isExamMode)
            return;
        this['confirmPopup'].open();
    }
    /**
     * Отменить завершение экзамена
     */
    cancelFinish() {
        this['confirmPopup'].close();
    }
    /**
     * Подтвердить завершение экзамена - показать все результаты
     */
    confirmFinish() {
        this['confirmPopup'].close();
        // Mark unanswered questions as skipped
        for (let qidx = 0; qidx < this.questions.length; qidx++) {
            if (this.selectedAnswers[qidx] === null) {
                this.statuses[qidx] = AnswerStatus.SKIP;
            }
        }
        // Reveal all answers
        for (let qidx = 0; qidx < this.questions.length; qidx++) {
            const question = this.questions[qidx];
            const selectedIdx = this.selectedAnswers[qidx];
            // Disable chips
            for (const suffix of ['0', '1', '2']) {
                const chip = this['c' + qidx + '-' + suffix];
                if (chip)
                    chip.setAttribute('disabled', 'true');
            }
            // Process all answer buttons
            for (let i = 0; i < question.Answers.length; i++) {
                const btn = this[qidx + '-' + i];
                if (!btn)
                    continue;
                btn.setAttribute('disabled', 'true');
                btn.removeAttribute('selected');
                // Show correct answer
                if (i === question.RDd) {
                    if (selectedIdx === i) {
                        // User selected the correct answer
                        btn.setAttribute('color', 'success');
                    }
                    else {
                        // Show correct answer that wasn't selected
                        btn.setAttribute('color', 'success');
                        btn.setAttribute('variant', 'outlined');
                    }
                }
                else if (selectedIdx === i) {
                    // User selected this wrong answer
                    if (i === question.Answers.length - 1) {
                        btn.setAttribute('color', 'warning'); // Skip
                    }
                    else {
                        btn.setAttribute('color', 'error'); // Wrong
                    }
                }
            }
        }
        // Show results popup
        this.resolveEnding(true);
    }
    // Regenerate a new randomSource and reload this page via SPA router (no full browser reload)
    regenerateShuffle() {
        const newSeed = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
        this.params.randomSource = newSeed;
        const paramsStr = encodeURIComponent(JSON.stringify(this.params));
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/testing/actual?params=' + paramsStr)), true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};
TestingActualPage = __decorate([
    RePage({
        markupURL: "./src/pages/TestingActualPage.hmle",
        cssURL: "./src/pages/TestingActualPage.html.css",
        jsURL: "./src/pages/TestingActualPage.html.ts",
        class: TestingActualPage,
    }, "/testing/actual"),
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