/**
 * Persistent store for user-built test presets ("генераторы").
 *
 * Presets are saved in the browser's localStorage so they survive reloads and work
 * offline. A preset captures a sampling configuration (subject, range, count, shuffle,
 * mode) plus two explicit question lists:
 *   - {@link TestPreset.requiredIds} — questions that must always appear in the test.
 *   - {@link TestPreset.excludedIds} — questions that must never appear.
 */

/** Sampling configuration — mirrors the "normal test" options (range / count / shuffle / mode). */
export interface PresetSelection {
    /** How many questions the generated test should contain (0 = all available). */
    count: number;
    /** 1-based inclusive start of the question range to sample from. */
    rangeStart: number;
    /** 1-based inclusive end of the question range to sample from. */
    rangeEnd: number;
    /** Disable shuffling of questions and answers. */
    noShuffle: boolean;
    /** Test flow: `main` reveals correctness per question, `exam` defers it to the end. */
    testType: "main" | "exam";
}

export interface TestPreset {
    id: string;
    name: string;
    /** Relative data file of the source subject (e.g. `s1/Math.json`). */
    subjectFile: string;
    /** Human-readable subject label, for display in the preset list. */
    subjectName: string;
    /** Semester label of the source subject. */
    semester: string;
    /** Total number of questions available in the subject (snapshot at save time). */
    totalQuestions: number;
    selection: PresetSelection;
    /** Ids of questions forced to appear. */
    requiredIds: Array<number | string>;
    /** Ids of questions banned from appearing. */
    excludedIds: Array<number | string>;
    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = "hellper:test-presets";

export default class PresetStore {
    /** Read every saved preset (newest first). Returns an empty list on any failure. */
    public static getAll(): TestPreset[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed as TestPreset[];
        } catch (e) {
            console.warn("[PresetStore] Failed to read presets", e);
            return [];
        }
    }

    /** Look up a single preset by id. */
    public static get(id: string): TestPreset | undefined {
        return this.getAll().find(p => p.id === id);
    }

    /**
     * Insert or update a preset. When `preset.id` matches an existing one it is replaced
     * (preserving `createdAt`); otherwise a fresh id and timestamps are assigned.
     * Returns the persisted preset.
     */
    public static save(preset: TestPreset): TestPreset {
        const all = this.getAll();
        const now = Date.now();
        const idx = preset.id ? all.findIndex(p => p.id === preset.id) : -1;

        const persisted: TestPreset = {
            ...preset,
            id: preset.id || this.newId(),
            createdAt: idx >= 0 ? all[idx].createdAt : now,
            updatedAt: now,
        };

        if (idx >= 0) {
            all[idx] = persisted;
        } else {
            all.unshift(persisted);
        }

        this.writeAll(all);
        return persisted;
    }

    /** Remove a preset by id. No-op if it doesn't exist. */
    public static delete(id: string): void {
        const all = this.getAll().filter(p => p.id !== id);
        this.writeAll(all);
    }

    private static writeAll(list: TestPreset[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.warn("[PresetStore] Failed to write presets", e);
        }
    }

    private static newId(): string {
        if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }
        return "preset-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    }
}
