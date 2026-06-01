import { Fetcher, Page, RePage, Router, TemplateHolder } from "@Purper";
import { Subject, ExamFile, ExamQuestion } from "../frac/Testing.js";
import SeededShuffle from "../lib/SeededShuffle.js";
import { KatexUtils } from "../KatexUtils.js";
import PopUp from "../components/PopUp.html.js";
import QuestionComponent, { QuestionModel, QuestionEventDetail } from "../components/QuestionComponent.html.js";
import QuestionLibrary, { HeaderInput } from "../lib/QuestionLibrary.js";

@RePage({
    markupURL: "./src/pages/TestingActualPage.hmle",
    cssURL: "./src/pages/TestingActualPage.html.css",
}, "/testing/actual")
export default class TestingActualPage extends Page {
    private params: {
        subject: Subject,
        type: string,
        limits: number,
        testType: "main" | "exam",
        startFrom: number | null,
        endAt: number | null,
        randomSource: string,
        noShuffle: boolean,
        /** Generator presets: ids forced to appear in the test. */
        forcedIds?: Array<number | string>,
        /** Generator presets: ids banned from appearing in the test. */
        excludedIds?: Array<number | string>
    };
    private questions: QuestionModel[] = [];
    /** Reveal strategy passed to each <question-component>. */
    private revealMode: "immediate" | "deferred" = "immediate";
    private isExamMode: boolean = false;

    public constructor(params?: string) {
        super();
        this.params = JSON.parse(decodeURIComponent(params!));
    }

    public async dispose(): Promise<void> {
    }

    protected async preInit(): Promise<void> {
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

        let pool: QuestionModel[] = (jj as ExamFile).Questions
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
        let models: QuestionModel[] = forced.concat(rest.slice(0, remaining));

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
    private toModel(q: ExamQuestion, fallbackId: number): QuestionModel {
        const correct = q.RId ?? 0;
        return {
            id: q.Id ?? fallbackId,
            title: q.Title,
            answers: (q.Answers ?? []).map((text, i) => ({ text, correct: i === correct })),
        };
    }

    protected async postLoad(holder: TemplateHolder) {
        const subjectFile = this.params.subject.file;

        // Push data into each question block (refs are resolved during template processing).
        this.questions.forEach((model, i) => {
            const comp = this[('qc' + i) as keyof this] as QuestionComponent | undefined;
            comp?.setQuestion(model);
            comp?.setStarred(QuestionLibrary.isFavorite(subjectFile, model.id));
        });


        // Seed display (if present)
        try {
            const seedEl = this['seedDisplay' as keyof this] as HTMLElement | undefined;
            if (seedEl) seedEl.textContent = String(this.params.randomSource ?? '');
        } catch (_) { }

        // The "finish test" button is only relevant for the deferred (exam) flow.
        const finishContainer = this['finishExamContainer' as keyof this] as HTMLElement | undefined;
        if (finishContainer) finishContainer.style.display = this.isExamMode ? 'block' : 'none';

        const restartContainer = this['restartContainer' as keyof this] as HTMLElement | undefined;
        if (restartContainer) restartContainer.style.display = 'none';
    }

    /** All question blocks, in display order. */
    private components(): QuestionComponent[] {
        return this.questions
            .map((_, i) => this['qc' + i as keyof this] as QuestionComponent | undefined)
            .filter((c): c is QuestionComponent => !!c);
    }

    /** Build the library header for a question of this test's subject. */
    private headerFor(id: string | number): HeaderInput {
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
    public onAnswered(event: CustomEvent): void {
        const detail = event.detail as QuestionEventDetail;
        const result = QuestionLibrary.statusToResult(detail.status);
        if (result) QuestionLibrary.recordAnswer(this.headerFor(detail.id), result);

        if (this.isExamMode) return; // deferred flow finishes via the button
        if (this.components().every(c => c.isAnswered())) {
            this.resolveEnding();
        }
    }

    /** Deferred (exam) flow: track selections (kept for future progress UI / hooks). */
    public onSelectionChange(event: CustomEvent): void {
        // No-op for now; selection is owned by each question block.
    }

    public onFavoriteToggle(event: CustomEvent): void {
        const { id, starred } = event.detail as { id: string | number; starred: boolean };
        QuestionLibrary.setFavorite(this.headerFor(id), starred);
    }

    private gatherCounts(): { correct: number, wrong: number, skip: number } {
        let correct = 0, wrong = 0, skip = 0;
        for (const c of this.components()) {
            switch (c.getStatus()) {
                case 'success': correct++; break;
                case 'wrong': wrong++; break;
                case 'skip': skip++; break;
            }
        }
        return { correct, wrong, skip };
    }

    private resolveEnding() {
        const { correct, wrong, skip } = this.gatherCounts();

        (this['resultCorrect' as keyof this] as HTMLElement).textContent = String(correct);
        (this['resultWrong' as keyof this] as HTMLElement).textContent = String(wrong);
        (this['resultSkip' as keyof this] as HTMLElement).textContent = String(skip);

        //25 => 24 * 2 - 1 = 47;
        if (this.questions.length === 25) {
            const score = (correct * 2) - wrong;
            (this['resultScore' as keyof this] as HTMLElement).textContent = String(score);
            (this['resultScoreBlock' as keyof this] as HTMLElement).style.display = 'block';
        }

        try { this.updateChristmasLights(correct); } catch (_) { }

        (this['resultPopup' as keyof this] as PopUp).open();
    }

    /**
     * Build a ring of lights around the tree with count equal to number of questions
     * and mark first `correct` lights as active (green). Caps total lights to avoid huge DOM.
     */
    private updateChristmasLights(correct: number): void {
        try {
            const svg = document.querySelector('.christmas-svg') as SVGSVGElement | null;
            if (!svg) return;

            const totalQuestions = (this.questions && this.questions.length) ? this.questions.length : 1;
            const MAX_LIGHTS = 120;
            const desiredLights = Math.max(1, Math.min(MAX_LIGHTS, totalQuestions));

            // Ensure lights group exists
            let lightsGroup = svg.querySelector('.lights') as SVGGElement | null;
            if (!lightsGroup) {
                lightsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                lightsGroup.setAttribute('class', 'lights');
                svg.appendChild(lightsGroup);
            }

            // If different count, rebuild as ring around tree center
            const existing = Array.from(lightsGroup.querySelectorAll('circle')) as SVGCircleElement[];
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

            const lights = Array.from(lightsGroup.querySelectorAll('.light')) as SVGElement[];
            const activeCount = Math.max(0, Math.min(lights.length, correct));

            lights.forEach((l, idx) => {
                const el = l as SVGElement;
                if (!el.getAttribute('data-orig-fill')) el.setAttribute('data-orig-fill', el.getAttribute('fill') || '');
                if (idx < activeCount) {
                    el.setAttribute('fill', '#00e676');
                    el.classList.add('active');
                } else {
                    const orig = el.getAttribute('data-orig-fill') || '';
                    if (orig) el.setAttribute('fill', orig);
                    el.classList.remove('active');
                }
            });

            const proportion = correct / Math.max(1, totalQuestions);
            const glowLevel = Math.max(0, Math.min(5, Math.round(proportion * 5)));
            for (let i = 0; i <= 5; i++) svg.classList.remove('glow-' + i);
            svg.classList.add('glow-' + glowLevel);
        } catch (e) {
            console.warn('updateChristmasLights failed', e);
        }
    }

    public closeResult(): void {
        (this['resultPopup' as keyof this] as PopUp).close();

        // Show restart button after closing results
        const restartContainer = this['restartContainer' as keyof this] as HTMLElement | undefined;
        if (restartContainer) {
            restartContainer.style.display = 'block';
        }

        // Hide finish exam button if it was visible
        const finishContainer = this['finishExamContainer' as keyof this] as HTMLElement | undefined;
        if (finishContainer) {
            finishContainer.style.display = 'none';
        }
    }

    /** Show the confirmation popup before finishing the exam. */
    public finishExam(): void {
        (this['confirmPopup' as keyof this] as PopUp).open();
    }

    /** Cancel finishing the exam. */
    public cancelFinish(): void {
        (this['confirmPopup' as keyof this] as PopUp).close();
    }

    /** Confirm finishing the exam — reveal every question and show the results. */
    public confirmFinish(): void {
        (this['confirmPopup' as keyof this] as PopUp).close();
        this.components().forEach(c => c.reveal());
        this.resolveEnding();
    }

    // Regenerate a new randomSource and reload this page via SPA router (no full browser reload)
    private regenerateShuffle(): void {
        const newSeed = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);

        this.params.randomSource = newSeed;

        const paramsStr = encodeURIComponent(JSON.stringify(this.params));
        Router.tryRouteTo(new URL(Fetcher.resolveUrl('/testing/actual?params=' + paramsStr)), true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
