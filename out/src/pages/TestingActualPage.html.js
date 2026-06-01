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
import QuestionLibrary from "../lib/QuestionLibrary.js";
let TestingActualPage = class TestingActualPage extends Page {
    params;
    questions = [];
    /** Reveal strategy passed to each <question-component>. */
    revealMode = "immediate";
    isExamMode = false;
    constructor(params) {
        super();
        this.params = JSON.parse(decodeURIComponent(params));
    }
    async dispose() {
    }
    async preInit() {
        if (this.params.randomSource === null) {
            const newSeed = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
                ? crypto.randomUUID()
                : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
            this.params.randomSource = newSeed;
        }
        this.isExamMode = this.params.testType === 'exam';
        // Exam: hide correctness until the user finishes. Main: reveal per question.
        this.revealMode = this.isExamMode ? 'deferred' : 'immediate';
        // Load the catalog so recorded headers carry the right semester / subject name.
        await QuestionLibrary.ensureCatalog();
        const jj = await Fetcher.fetchJSON('./resources/data' + '/' + this.params.subject.file);
        let pool = jj.Questions
            .slice(this.params.startFrom ?? 0, this.params.endAt ?? undefined)
            .map((q, idx) => this.toModel(q, idx + 1));
        // Generator presets: drop banned questions, force-include required ones, then
        // fill the remaining slots from the sampled pool. When no preset lists are given,
        // this collapses to the original "shuffle → slice(limit)" behaviour.
        const excluded = new Set((this.params.excludedIds ?? []).map(String));
        const required = new Set((this.params.forcedIds ?? []).map(String));
        if (excluded.size > 0) {
            pool = pool.filter(m => !excluded.has(String(m.id)));
        }
        const forced = required.size > 0 ? pool.filter(m => required.has(String(m.id))) : [];
        let rest = required.size > 0 ? pool.filter(m => !required.has(String(m.id))) : pool;
        if (!this.params.noShuffle)
            rest = SeededShuffle.shuffle(rest, this.params.randomSource);
        const limit = this.params.limits && this.params.limits > 0 ? Number(this.params.limits) : pool.length;
        const remaining = Math.max(0, limit - forced.length);
        let models = forced.concat(rest.slice(0, remaining));
        // Mix the forced questions into the body of the test instead of pinning them first.
        if (!this.params.noShuffle && forced.length > 0)
            models = SeededShuffle.shuffle(models, this.params.randomSource);
        // Shuffle the answers of every question with a derived seed, render KaTeX,
        // then assign the final display position.
        let seed = this.params.randomSource;
        models.forEach((model, i) => {
            if (!this.params.noShuffle) {
                model.answers = SeededShuffle.shuffle(model.answers, seed);
                seed = SeededShuffle.deriveNextSeed(seed);
            }
            model.index = i + 1;
            model.title = KatexUtils.renderInlineString(model.title);
            model.answers.forEach(a => a.text = KatexUtils.renderInlineString(a.text));
        });
        this.questions = models;
        return Promise.resolve();
    }
    /** Convert a raw exam question into a JSON-agnostic QuestionModel. */
    toModel(q, fallbackId) {
        const correct = q.RId ?? 0;
        return {
            id: q.Id ?? fallbackId,
            title: q.Title,
            answers: (q.Answers ?? []).map((text, i) => ({ text, correct: i === correct })),
        };
    }
    async postLoad(holder) {
        const subjectFile = this.params.subject.file;
        // Push data into each question block (refs are resolved during template processing).
        this.questions.forEach((model, i) => {
            const comp = this[('qc' + i)];
            comp?.setQuestion(model);
            comp?.setStarred(QuestionLibrary.isFavorite(subjectFile, model.id));
        });
        // Seed display (if present)
        try {
            const seedEl = this['seedDisplay'];
            if (seedEl)
                seedEl.textContent = String(this.params.randomSource ?? '');
        }
        catch (_) { }
        // The "finish test" button is only relevant for the deferred (exam) flow.
        const finishContainer = this['finishExamContainer'];
        if (finishContainer)
            finishContainer.style.display = this.isExamMode ? 'block' : 'none';
        const restartContainer = this['restartContainer'];
        if (restartContainer)
            restartContainer.style.display = 'none';
    }
    /** All question blocks, in display order. */
    components() {
        return this.questions
            .map((_, i) => this['qc' + i])
            .filter((c) => !!c);
    }
    /** Build the library header for a question of this test's subject. */
    headerFor(id) {
        return {
            subjectFile: this.params.subject.file,
            subjectName: this.params.subject.translatedName || this.params.subject.name,
            questionId: id,
        };
    }
    /**
     * A question reported its result. Record the outcome in the library (both flows fire
     * `answered` exactly once per question — immediately on pick, or on reveal at finish).
     * In the immediate (main) flow, also show the results popup once everything is answered.
     */
    onAnswered(event) {
        const detail = event.detail;
        const result = QuestionLibrary.statusToResult(detail.status);
        if (result)
            QuestionLibrary.recordAnswer(this.headerFor(detail.id), result);
        if (this.isExamMode)
            return; // deferred flow finishes via the button
        if (this.components().every(c => c.isAnswered())) {
            this.resolveEnding();
        }
    }
    /** Deferred (exam) flow: track selections (kept for future progress UI / hooks). */
    onSelectionChange(event) {
        // No-op for now; selection is owned by each question block.
    }
    onFavoriteToggle(event) {
        const { id, starred } = event.detail;
        QuestionLibrary.setFavorite(this.headerFor(id), starred);
    }
    gatherCounts() {
        let correct = 0, wrong = 0, skip = 0;
        for (const c of this.components()) {
            switch (c.getStatus()) {
                case 'success':
                    correct++;
                    break;
                case 'wrong':
                    wrong++;
                    break;
                case 'skip':
                    skip++;
                    break;
            }
        }
        return { correct, wrong, skip };
    }
    resolveEnding() {
        const { correct, wrong, skip } = this.gatherCounts();
        this['resultCorrect'].textContent = String(correct);
        this['resultWrong'].textContent = String(wrong);
        this['resultSkip'].textContent = String(skip);
        //25 => 24 * 2 - 1 = 47;
        if (this.questions.length === 25) {
            const score = (correct * 2) - wrong;
            this['resultScore'].textContent = String(score);
            this['resultScoreBlock'].style.display = 'block';
        }
        try {
            this.updateChristmasLights(correct);
        }
        catch (_) { }
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
    /** Show the confirmation popup before finishing the exam. */
    finishExam() {
        this['confirmPopup'].open();
    }
    /** Cancel finishing the exam. */
    cancelFinish() {
        this['confirmPopup'].close();
    }
    /** Confirm finishing the exam — reveal every question and show the results. */
    confirmFinish() {
        this['confirmPopup'].close();
        this.components().forEach(c => c.reveal());
        this.resolveEnding();
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
    }, "/testing/actual"),
    __metadata("design:paramtypes", [String])
], TestingActualPage);
export default TestingActualPage;
//# sourceMappingURL=TestingActualPage.html.js.map