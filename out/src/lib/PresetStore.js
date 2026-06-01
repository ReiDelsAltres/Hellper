/**
 * Persistent store for user-built test presets ("генераторы").
 *
 * Presets are saved in the browser's localStorage so they survive reloads and work
 * offline. A preset captures a sampling configuration (subject, range, count, shuffle,
 * mode) plus two explicit question lists:
 *   - {@link TestPreset.requiredIds} — questions that must always appear in the test.
 *   - {@link TestPreset.excludedIds} — questions that must never appear.
 */
const STORAGE_KEY = "hellper:test-presets";
export default class PresetStore {
    /** Read every saved preset (newest first). Returns an empty list on any failure. */
    static getAll() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw)
                return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed))
                return [];
            return parsed;
        }
        catch (e) {
            console.warn("[PresetStore] Failed to read presets", e);
            return [];
        }
    }
    /** Look up a single preset by id. */
    static get(id) {
        return this.getAll().find(p => p.id === id);
    }
    /**
     * Insert or update a preset. When `preset.id` matches an existing one it is replaced
     * (preserving `createdAt`); otherwise a fresh id and timestamps are assigned.
     * Returns the persisted preset.
     */
    static save(preset) {
        const all = this.getAll();
        const now = Date.now();
        const idx = preset.id ? all.findIndex(p => p.id === preset.id) : -1;
        const persisted = {
            ...preset,
            id: preset.id || this.newId(),
            createdAt: idx >= 0 ? all[idx].createdAt : now,
            updatedAt: now,
        };
        if (idx >= 0) {
            all[idx] = persisted;
        }
        else {
            all.unshift(persisted);
        }
        this.writeAll(all);
        return persisted;
    }
    /** Remove a preset by id. No-op if it doesn't exist. */
    static delete(id) {
        const all = this.getAll().filter(p => p.id !== id);
        this.writeAll(all);
    }
    static writeAll(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }
        catch (e) {
            console.warn("[PresetStore] Failed to write presets", e);
        }
    }
    static newId() {
        if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }
        return "preset-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    }
}
//# sourceMappingURL=PresetStore.js.map