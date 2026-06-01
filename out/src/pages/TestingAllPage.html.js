var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TestingAllPage_1;
import { Fetcher, Observable, Page, RePage } from "@Purper";
import { KatexUtils } from "../KatexUtils.js";
let TestingAllPage = class TestingAllPage extends Page {
    static { TestingAllPage_1 = this; }
    allSubjects = [];
    allItems = [];
    filteredItems = [];
    displayItems = new Observable([]);
    countText = new Observable("Загрузка...");
    truncatedText = new Observable("");
    showTruncated = new Observable(false);
    searchInput;
    typeFilter;
    semesterSelect;
    subjectSelect;
    semesters = [];
    subjectNames = [];
    static INITIAL_BATCH = 60;
    static BATCH_STEP = 40;
    static SCROLL_THRESHOLD_PX = 800;
    visibleCount = 0;
    intersectionObserver = null;
    batchPending = false;
    searchValueListener = () => this.applyFilters();
    async preInit() {
        const [examData, colloquiumData] = await Promise.all([
            Fetcher.fetchJSON('./resources/data/testing.json'),
            Fetcher.fetchJSON('./resources/data/colloquim_testing.json'),
        ]);
        for (const sem of examData) {
            for (const sub of sem.subjects) {
                this.allSubjects.push({ subject: sub, semester: sem.number, type: "exam" });
            }
        }
        for (const sem of colloquiumData) {
            for (const sub of sem.subjects) {
                this.allSubjects.push({ subject: sub, semester: sem.number, type: "colloquium" });
            }
        }
        const semSet = new Set();
        const subSet = new Set();
        for (const us of this.allSubjects) {
            semSet.add(us.semester);
            subSet.add(us.subject.translatedName || us.subject.name);
        }
        this.semesters = [...semSet];
        this.subjectNames = [...subSet].sort();
        await this.loadAllQuestions();
        this.filteredItems = this.allItems.slice();
        this.visibleCount = Math.min(TestingAllPage_1.INITIAL_BATCH, this.filteredItems.length);
        this.displayItems.setObject(this.filteredItems.slice(0, this.visibleCount));
        this.updateCounters();
    }
    async postLoad(holder) {
        console.log('[DBG postLoad] called; container=', !!this['questionsContainer'], 'typeFilter=', !!this.typeFilter, 'searchInput=', !!this.searchInput);
        if (this.typeFilter?.buttonMap) {
            this.typeFilter.buttonMap.forEach((selected, btn) => {
                btn.Variant.setObject(selected ? 'filled' : 'outlined');
            });
        }
        if (this.searchInput) {
            this.searchInput.Value.subscribe(this.searchValueListener);
        }
        this.updateSubjectOptions();
        this.applyFilters();
        this.setupIntersectionObserver();
        window.addEventListener('scroll', this.onScroll, { passive: true });
    }
    async dispose() {
        if (this.searchInput) {
            this.searchInput.Value.unsubscribe(this.searchValueListener);
        }
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }
        window.removeEventListener('scroll', this.onScroll);
    }
    async loadAllQuestions() {
        const items = [];
        const fetches = this.allSubjects.map(async (us) => {
            try {
                const data = await Fetcher.fetchJSON('./resources/data/' + us.subject.file);
                const subjectLabel = us.subject.translatedName || us.subject.name;
                for (const q of data.Questions) {
                    if (us.type === "exam") {
                        const eq = q;
                        const correctIdx = eq.RId ?? 0;
                        items.push({
                            Id: q.Id,
                            Title: KatexUtils.renderInlineString(q.Title),
                            type: "exam",
                            subjectName: subjectLabel,
                            semester: us.semester,
                            isExam: true,
                            isColloquium: false,
                            examAnswers: q.Answers.map((a, i) => ({
                                text: KatexUtils.renderInlineString(a),
                                isCorrect: i === correctIdx,
                            })),
                            referenceAnswers: [],
                            Keywords: [],
                        });
                    }
                    else {
                        const cq = q;
                        items.push({
                            Id: q.Id,
                            Title: q.Title,
                            type: "colloquium",
                            subjectName: subjectLabel,
                            semester: us.semester,
                            isExam: false,
                            isColloquium: true,
                            examAnswers: [],
                            referenceAnswers: q.Answers,
                            Keywords: cq.Keywords ?? [],
                        });
                    }
                }
            }
            catch (e) {
                console.warn('Failed to load', us.subject.file, e);
            }
        });
        await Promise.all(fetches);
        this.allItems = items;
    }
    onTypeChange(event) {
        const buttons = event.detail.buttons;
        buttons.forEach((isSelected, btn) => {
            btn.Variant.setObject(isSelected ? 'filled' : 'outlined');
        });
        this.applyFilters();
    }
    onSearchInput() {
        this.applyFilters();
    }
    onSemesterChange() {
        this.updateSubjectOptions();
        this.applyFilters();
    }
    onSubjectChange() {
        this.applyFilters();
    }
    updateSubjectOptions() {
        if (!this.subjectSelect)
            return;
        const selectedSem = this.semesterSelect?.value || '';
        const relevantSubjects = new Set();
        for (const us of this.allSubjects) {
            if (!selectedSem || us.semester === selectedSem) {
                relevantSubjects.add(us.subject.translatedName || us.subject.name);
            }
        }
        const currentVal = this.subjectSelect.value;
        this.subjectSelect.innerHTML = '<option value="">Все предметы</option>';
        for (const name of [...relevantSubjects].sort()) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            this.subjectSelect.appendChild(opt);
        }
        if (relevantSubjects.has(currentVal)) {
            this.subjectSelect.value = currentVal;
        }
    }
    applyFilters() {
        console.log('[DBG applyFilters] called');
        const searchText = (this.searchInput?.Value?.value ?? '').toLowerCase().trim();
        const rawTypeValue = this.typeFilter?.Value?.value || '';
        const typeValue = (rawTypeValue === 'exam' || rawTypeValue === 'colloquium') ? rawTypeValue : 'all';
        const semValue = this.semesterSelect?.value || '';
        const subValue = this.subjectSelect?.value || '';
        this.filteredItems = this.allItems.filter(item => {
            if (typeValue !== 'all' && item.type !== typeValue)
                return false;
            if (semValue && item.semester !== semValue)
                return false;
            if (subValue && item.subjectName !== subValue)
                return false;
            if (searchText) {
                const haystack = (item.Title + ' ' +
                    item.examAnswers.map(a => a.text).join(' ') + ' ' +
                    item.referenceAnswers.join(' ') + ' ' +
                    item.Keywords.join(' ')).toLowerCase();
                if (!haystack.includes(searchText))
                    return false;
            }
            return true;
        });
        this.visibleCount = 0;
        this.appendNextBatch();
    }
    setupIntersectionObserver() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        const sentinel = document.querySelector('.scroll-sentinel');
        if (!sentinel)
            return;
        this.intersectionObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting && this.visibleCount < this.filteredItems.length) {
                    this.appendNextBatch();
                }
            }
        }, { rootMargin: '0px 0px 800px 0px' });
        this.intersectionObserver.observe(sentinel);
    }
    onScroll = () => {
        if (this.visibleCount >= this.filteredItems.length)
            return;
        if (this.batchPending)
            return;
        const scrollY = window.pageYOffset ?? document.documentElement.scrollTop ?? 0;
        const viewH = window.innerHeight ?? 0;
        const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight);
        if (scrollY + viewH + TestingAllPage_1.SCROLL_THRESHOLD_PX >= docH) {
            this.appendNextBatch();
        }
    };
    loadMore() {
        this.appendNextBatch();
    }
    appendNextBatch() {
        if (this.visibleCount >= this.filteredItems.length) {
            this.updateCounters();
            return;
        }
        if (this.batchPending)
            return;
        this.batchPending = true;
        const nextSize = this.visibleCount === 0
            ? TestingAllPage_1.INITIAL_BATCH
            : this.visibleCount + TestingAllPage_1.BATCH_STEP;
        this.visibleCount = Math.min(nextSize, this.filteredItems.length);
        this.displayItems.setObject(this.filteredItems.slice(0, this.visibleCount));
        this.bindVisibleExamQuestions();
        this.updateCounters();
        requestAnimationFrame(() => {
            this.batchPending = false;
        });
    }
    /** Map an exam DisplayItem into the JSON-agnostic QuestionComponent model. */
    toModel(item) {
        return {
            id: item.Id,
            title: item.Title,
            answers: item.examAnswers.map(a => ({ text: a.text, correct: a.isCorrect })),
            tags: [
                { text: "Экзамен", color: "primary" },
                { text: item.subjectName, color: "tertiary" },
            ],
        };
    }
    /**
     * Feed the currently visible exam questions into their <question-component> blocks.
     * The blocks appear in the same relative order as the exam items in the visible slice,
     * so we can zip them positionally.
     */
    bindVisibleExamQuestions() {
        const container = this['questionsContainer'];
        console.log('[DBG bind] container=', !!container, 'visibleCount=', this.visibleCount);
        if (!container)
            return;
        const comps = Array.from(container.querySelectorAll('question-component'));
        const examItems = this.filteredItems.slice(0, this.visibleCount).filter(it => it.isExam);
        console.log('[DBG bind] comps=', comps.length, 'examItems=', examItems.length, 'hasSetQ=', comps[0] ? typeof comps[0].setQuestion : 'n/a');
        comps.forEach((comp, i) => {
            if (examItems[i])
                comp.setQuestion(this.toModel(examItems[i]));
        });
    }
    updateCounters() {
        this.countText.setObject(`${this.filteredItems.length} / ${this.allItems.length}`);
        if (this.visibleCount < this.filteredItems.length) {
            this.showTruncated.setObject(true);
            this.truncatedText.setObject(`Показано ${this.visibleCount} из ${this.filteredItems.length}. Пролистайте вниз для загрузки остальных.`);
        }
        else {
            this.showTruncated.setObject(false);
        }
    }
};
TestingAllPage = TestingAllPage_1 = __decorate([
    RePage({
        markupURL: "./src/pages/TestingAllPage.hmle",
        cssURL: "./src/pages/TestingAllPage.html.css",
    }, "/testing/all")
], TestingAllPage);
export default TestingAllPage;
//# sourceMappingURL=TestingAllPage.html.js.map