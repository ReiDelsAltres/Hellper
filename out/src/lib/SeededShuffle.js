/* small deterministic shuffle helper using a string seed
 * exports functions for hashing a seed into a 32-bit integer and performing
 * a seeded Fisher–Yates shuffle using a small, fast PRNG (mulberry32)
 */
export default class SeededShuffle {
    // FNV-1a 32-bit hash for strings
    static hashSeed(seed) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < seed.length; i++) {
            h ^= seed.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h >>> 0;
    }
    // mulberry32 PRNG, returns a function that produces uniform numbers in [0,1)
    static mulberry32(seedInt) {
        let a = seedInt | 0;
        return function () {
            a |= 0;
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    // Deterministic shuffle: returns shuffled array and the mapping from original index -> new index
    static shuffleWithMapping(items, seed) {
        if (!seed || items.length <= 1) {
            return { shuffled: items.slice(), newIndexForOld: items.map((_, i) => i) };
        }
        const seedInt = this.hashSeed(seed);
        const rand = this.mulberry32(seedInt);
        // create pairs to retain original indices
        const pairs = items.map((v, i) => ({ v, i }));
        // Fisher-Yates
        for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            const tmp = pairs[i];
            pairs[i] = pairs[j];
            pairs[j] = tmp;
        }
        const shuffled = pairs.map(p => p.v);
        // newIndexForOld[oldIndex] = newIndex
        const newIndexForOld = new Array(items.length);
        pairs.forEach((p, newIdx) => {
            newIndexForOld[p.i] = newIdx;
        });
        return { shuffled, newIndexForOld };
    }
    /**
     * Convenience method: just returns the shuffled array for a given seed
     */
    static shuffle(items, seed) {
        return this.shuffleWithMapping(items, seed).shuffled;
    }
}
//# sourceMappingURL=SeededShuffle.js.map