import { QuestionModel } from "../components/QuestionComponent.html.js";
/**
 * Outcome of a single answer attempt, as judged by {@link QuestionComponent}.
 * Mirrors its `QuestionStatus` minus the transient `unanswered` state.
 */
export type AnswerResult = "correct" | "wrong" | "skip";
/**
 * Everything required to locate a question and label it in the UI.
 * `subjectFile` + `questionId` together form the entry's identity.
 */
export interface QuestionHeader {
    /** Relative data file of the source subject (e.g. `s1/Math.json`) — the fetch key. */
    subjectFile: string;
    /** Human-readable subject label, for display. */
    subjectName: string;
    /** Semester label of the source subject. */
    semester: string;
    /** Question id, unique within its subject file. */
    questionId: string | number;
}
/** Aggregated answer tally for a single question, accumulated across every test run. */
export interface QuestionStatistics {
    correct: number;
    wrong: number;
    skip: number;
}
/** User-set flags attached to a question. */
export interface QuestionMeta {
    favorite: boolean;
}
/** A single tracked question: where it lives, how the user has done on it, and its flags. */
export interface QuestionEntry {
    header: QuestionHeader;
    statistics: QuestionStatistics;
    meta: QuestionMeta;
}
/** Header fields a caller must supply; `semester` is enriched from the catalog when omitted. */
export type HeaderInput = Pick<QuestionHeader, "subjectFile" | "questionId"> & Partial<QuestionHeader>;
/**
 * Central per-question cache and statistics manager.
 *
 * Owns one {@link QuestionEntry} per question the user has interacted with. Every answer
 * is recorded via {@link recordAnswer}; the star button toggles {@link toggleFavorite}.
 * Entries are keyed by `subjectFile::questionId` and persisted to `localStorage`, so stats
 * and favourites survive reloads and work offline.
 *
 * It doubles as a content cache: {@link resolveModel} / {@link resolveFavorites} fetch a
 * subject's data file once, memoise it, and hand back render-ready {@link QuestionModel}s —
 * so favourites (which store only a header) can be re-displayed without the host page
 * re-loading the source JSON.
 *
 * This is the single source of truth for favourites; it fully replaces the old
 * `FavoritesStore` and transparently imports its data on first use.
 */
export default class QuestionLibrary {
    private static _entries;
    private static _catalog;
    private static _catalogPromise;
    private static _content;
    private static _contentPromises;
    private static key;
    /** Map a {@link QuestionComponent} status to a recordable result (`unanswered` → null). */
    static statusToResult(status: string): AnswerResult | null;
    /**
     * Load the subject catalog (testing.json) once so semesters/subject names can be
     * filled in for headers. Idempotent — concurrent callers share one fetch. Also runs
     * the one-time import of any legacy `FavoritesStore` data.
     */
    static ensureCatalog(): Promise<void>;
    /** Semester label for a subject file, or `""` when the catalog is unloaded/unknown. */
    static getSemester(subjectFile: string): string;
    /** Best-known display name for a subject file, falling back to the file itself. */
    static getSubjectName(subjectFile: string, fallback?: string): string;
    private static load;
    private static persist;
    /** Build a complete header, enriching missing display fields from the catalog. */
    private static resolveHeader;
    /** Fetch (or create) the entry for a question, refreshing its header from the input. */
    private static ensureEntry;
    /** Every tracked question, in insertion order. */
    static getAll(): QuestionEntry[];
    /** The entry for a question, or `undefined` if it has never been seen. */
    static getEntry(subjectFile: string, questionId: string | number): QuestionEntry | undefined;
    /**
     * Record one answer outcome, creating the entry on first sight and bumping the
     * matching counter. Returns the (updated) entry.
     */
    static recordAnswer(header: HeaderInput, result: AnswerResult): QuestionEntry;
    static isFavorite(subjectFile: string, questionId: string | number): boolean;
    /** Set the favourite flag explicitly, creating the entry if needed. */
    static setFavorite(header: HeaderInput, favorite: boolean): void;
    /** Flip the favourite flag. Returns the new state. */
    static toggleFavorite(header: HeaderInput): boolean;
    /** Every favourited entry, in insertion order. */
    static getFavorites(): QuestionEntry[];
    private static toModel;
    /** Fetch & memoise a subject file as an id → model lookup. Concurrent calls share one fetch. */
    private static loadContent;
    /** Resolve a single question's render-ready model, or `null` if it can't be found. */
    static resolveModel(subjectFile: string, questionId: string | number): Promise<QuestionModel | null>;
    /**
     * Resolve every favourite to a render-ready model paired with its entry, fetching each
     * distinct subject file at most once. Favourites whose source question no longer exists
     * are dropped.
     */
    static resolveFavorites(): Promise<Array<{
        entry: QuestionEntry;
        model: QuestionModel;
    }>>;
    /** One-time import of the old `FavoritesStore` array into the entry store. */
    private static importLegacyFavorites;
}
//# sourceMappingURL=QuestionLibrary.d.ts.map