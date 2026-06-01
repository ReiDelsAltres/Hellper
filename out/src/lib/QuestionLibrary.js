import { Fetcher } from "@Purper";
import { KatexUtils } from "../KatexUtils.js";
const STORAGE_KEY = "hellper:question-library";
/** Legacy favourites store, imported once on first catalog load. */
const LEGACY_FAVORITES_KEY = "hellper:favorites";
const CATALOG_URL = "./resources/data/testing.json";
const DATA_DIR = "./resources/data/";
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
    // ── Entry store (lazy-loaded from localStorage, kept in memory) ──
    static _entries = null;
    // ── Catalog: subjectFile → { semester, subjectName } ──
    static _catalog = null;
    static _catalogPromise = null;
    // ── Content cache: subjectFile → (questionId → render-ready model) ──
    static _content = new Map();
    static _contentPromises = new Map();
    // ──────────────────────────────────────────────────────────────────────────
    // Identity
    // ──────────────────────────────────────────────────────────────────────────
    static key(subjectFile, questionId) {
        return subjectFile + "::" + String(questionId);
    }
    /** Map a {@link QuestionComponent} status to a recordable result (`unanswered` → null). */
    static statusToResult(status) {
        switch (status) {
            case "success": return "correct";
            case "wrong": return "wrong";
            case "skip": return "skip";
            default: return null;
        }
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Catalog (semester resolution + one-time legacy import)
    // ──────────────────────────────────────────────────────────────────────────
    /**
     * Load the subject catalog (testing.json) once so semesters/subject names can be
     * filled in for headers. Idempotent — concurrent callers share one fetch. Also runs
     * the one-time import of any legacy `FavoritesStore` data.
     */
    static ensureCatalog() {
        if (this._catalogPromise)
            return this._catalogPromise;
        this._catalogPromise = (async () => {
            this._catalog = new Map();
            try {
                const semesters = await Fetcher.fetchJSON(CATALOG_URL);
                for (const sem of semesters) {
                    for (const sub of sem.subjects) {
                        this._catalog.set(sub.file, {
                            semester: sem.number,
                            subjectName: sub.translatedName || sub.name,
                        });
                    }
                }
            }
            catch (e) {
                console.warn("[QuestionLibrary] Failed to load catalog", e);
            }
            this.importLegacyFavorites();
        })();
        return this._catalogPromise;
    }
    /** Semester label for a subject file, or `""` when the catalog is unloaded/unknown. */
    static getSemester(subjectFile) {
        return this._catalog?.get(subjectFile)?.semester ?? "";
    }
    /** Best-known display name for a subject file, falling back to the file itself. */
    static getSubjectName(subjectFile, fallback) {
        return this._catalog?.get(subjectFile)?.subjectName ?? fallback ?? subjectFile;
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Entry store
    // ──────────────────────────────────────────────────────────────────────────
    static load() {
        if (this._entries)
            return this._entries;
        const map = new Map();
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                for (const [k, v] of Object.entries(parsed)) {
                    if (v && v.header && v.statistics && v.meta)
                        map.set(k, v);
                }
            }
        }
        catch (e) {
            console.warn("[QuestionLibrary] Failed to read store", e);
        }
        this._entries = map;
        return map;
    }
    static persist() {
        if (!this._entries)
            return;
        try {
            const obj = {};
            for (const [k, v] of this._entries)
                obj[k] = v;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
        }
        catch (e) {
            console.warn("[QuestionLibrary] Failed to write store", e);
        }
    }
    /** Build a complete header, enriching missing display fields from the catalog. */
    static resolveHeader(input) {
        return {
            subjectFile: input.subjectFile,
            questionId: input.questionId,
            subjectName: input.subjectName ?? this.getSubjectName(input.subjectFile),
            semester: input.semester ?? this.getSemester(input.subjectFile),
        };
    }
    /** Fetch (or create) the entry for a question, refreshing its header from the input. */
    static ensureEntry(input) {
        const store = this.load();
        const key = this.key(input.subjectFile, input.questionId);
        let entry = store.get(key);
        if (!entry) {
            entry = {
                header: this.resolveHeader(input),
                statistics: { correct: 0, wrong: 0, skip: 0 },
                meta: { favorite: false },
            };
            store.set(key, entry);
        }
        else {
            // Keep header display fields fresh (semester/name may have been unknown before).
            const resolved = this.resolveHeader(input);
            if (resolved.semester)
                entry.header.semester = resolved.semester;
            if (resolved.subjectName)
                entry.header.subjectName = resolved.subjectName;
        }
        return entry;
    }
    /** Every tracked question, in insertion order. */
    static getAll() {
        return [...this.load().values()];
    }
    /** The entry for a question, or `undefined` if it has never been seen. */
    static getEntry(subjectFile, questionId) {
        return this.load().get(this.key(subjectFile, questionId));
    }
    /**
     * Record one answer outcome, creating the entry on first sight and bumping the
     * matching counter. Returns the (updated) entry.
     */
    static recordAnswer(header, result) {
        const entry = this.ensureEntry(header);
        entry.statistics[result]++;
        this.persist();
        return entry;
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Favourites
    // ──────────────────────────────────────────────────────────────────────────
    static isFavorite(subjectFile, questionId) {
        return this.getEntry(subjectFile, questionId)?.meta.favorite ?? false;
    }
    /** Set the favourite flag explicitly, creating the entry if needed. */
    static setFavorite(header, favorite) {
        const entry = this.ensureEntry(header);
        entry.meta.favorite = favorite;
        this.persist();
    }
    /** Flip the favourite flag. Returns the new state. */
    static toggleFavorite(header) {
        const entry = this.ensureEntry(header);
        entry.meta.favorite = !entry.meta.favorite;
        this.persist();
        return entry.meta.favorite;
    }
    /** Every favourited entry, in insertion order. */
    static getFavorites() {
        return this.getAll().filter(e => e.meta.favorite);
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Content cache (header → render-ready question)
    // ──────────────────────────────────────────────────────────────────────────
    static toModel(q) {
        const correct = q.RId ?? 0;
        return {
            id: q.Id,
            title: KatexUtils.renderInlineString(q.Title),
            answers: (q.Answers ?? []).map((text, i) => ({
                text: KatexUtils.renderInlineString(text),
                correct: i === correct,
            })),
        };
    }
    /** Fetch & memoise a subject file as an id → model lookup. Concurrent calls share one fetch. */
    static loadContent(subjectFile) {
        const cached = this._content.get(subjectFile);
        if (cached)
            return Promise.resolve(cached);
        const inflight = this._contentPromises.get(subjectFile);
        if (inflight)
            return inflight;
        const promise = (async () => {
            const byId = new Map();
            try {
                const data = await Fetcher.fetchJSON(DATA_DIR + subjectFile);
                for (const q of data.Questions)
                    byId.set(String(q.Id), this.toModel(q));
            }
            catch (e) {
                console.warn("[QuestionLibrary] Failed to load content for", subjectFile, e);
            }
            this._content.set(subjectFile, byId);
            this._contentPromises.delete(subjectFile);
            return byId;
        })();
        this._contentPromises.set(subjectFile, promise);
        return promise;
    }
    /** Resolve a single question's render-ready model, or `null` if it can't be found. */
    static async resolveModel(subjectFile, questionId) {
        const byId = await this.loadContent(subjectFile);
        return byId.get(String(questionId)) ?? null;
    }
    /**
     * Resolve every favourite to a render-ready model paired with its entry, fetching each
     * distinct subject file at most once. Favourites whose source question no longer exists
     * are dropped.
     */
    static async resolveFavorites() {
        const favorites = this.getFavorites();
        const files = [...new Set(favorites.map(e => e.header.subjectFile))];
        await Promise.all(files.map(f => this.loadContent(f)));
        const out = [];
        for (const entry of favorites) {
            const model = this._content.get(entry.header.subjectFile)?.get(String(entry.header.questionId));
            if (model)
                out.push({ entry, model });
        }
        return out;
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Legacy migration
    // ──────────────────────────────────────────────────────────────────────────
    /** One-time import of the old `FavoritesStore` array into the entry store. */
    static importLegacyFavorites() {
        let raw;
        try {
            raw = localStorage.getItem(LEGACY_FAVORITES_KEY);
        }
        catch {
            return;
        }
        if (!raw)
            return;
        try {
            const legacy = JSON.parse(raw);
            if (Array.isArray(legacy)) {
                for (const fav of legacy) {
                    if (!fav?.subjectFile || fav.model?.id === undefined)
                        continue;
                    this.setFavorite({
                        subjectFile: fav.subjectFile,
                        subjectName: fav.subjectName,
                        questionId: fav.model.id,
                    }, true);
                }
            }
        }
        catch (e) {
            console.warn("[QuestionLibrary] Failed to import legacy favourites", e);
        }
        // Drop the legacy key so the import runs only once.
        try {
            localStorage.removeItem(LEGACY_FAVORITES_KEY);
        }
        catch { /* ignore */ }
    }
}
//# sourceMappingURL=QuestionLibrary.js.map