import { Page, TemplateHolder } from "@Purper";
interface DisplayAnswer {
    text: string;
    isCorrect: boolean;
}
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
    private updateCounters;
    answerColor(answer: DisplayAnswer): string;
    answerVariant(answer: DisplayAnswer): string;
}
export {};
//# sourceMappingURL=TestingAllPage.html.d.ts.map