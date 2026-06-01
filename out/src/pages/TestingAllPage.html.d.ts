import { Page, TemplateHolder } from "@Purper";
export default class TestingAllPage extends Page {
    private allSubjects;
    private allItems;
    private filteredItems;
    private displayItems;
    private countText;
    private truncatedText;
    private showTruncated;
    private searchInput?;
    private typeFilter?;
    private semesterSelect?;
    private subjectSelect?;
    private semesters;
    private subjectNames;
    private static readonly INITIAL_BATCH;
    private static readonly BATCH_STEP;
    private static readonly SCROLL_THRESHOLD_PX;
    private visibleCount;
    private intersectionObserver;
    private batchPending;
    private readonly searchValueListener;
    protected preInit(): Promise<void>;
    protected postLoad(holder: TemplateHolder): Promise<void>;
    dispose(): Promise<void>;
    private loadAllQuestions;
    onTypeChange(event: CustomEvent<{}>): void;
    onSearchInput(): void;
    onSemesterChange(): void;
    onSubjectChange(): void;
    private updateSubjectOptions;
    private applyFilters;
    private setupIntersectionObserver;
    private readonly onScroll;
    loadMore(): void;
    private appendNextBatch;
    /** Map an exam DisplayItem into the JSON-agnostic QuestionComponent model. */
    private toModel;
    /**
     * Feed the currently visible exam questions into their <question-component> blocks.
     * The blocks appear in the same relative order as the exam items in the visible slice,
     * so we can zip them positionally.
     */
    private bindVisibleExamQuestions;
    private updateCounters;
}
//# sourceMappingURL=TestingAllPage.html.d.ts.map