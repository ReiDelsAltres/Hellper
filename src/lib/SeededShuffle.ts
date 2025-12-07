/* small deterministic shuffle helper using a string seed
 * exports functions for hashing a seed into a 32-bit integer and performing
 * a seeded Fisher–Yates shuffle using a small, fast PRNG (mulberry32)
 */

export default class SeededShuffle {
    // FNV-1a 32-bit hash for strings
    public static hashSeed(seed: string): number {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < seed.length; i++) {
            h ^= seed.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h >>> 0;
    }

    // mulberry32 PRNG, returns a function that produces uniform numbers in [0,1)
    public static mulberry32(seedInt: number): () => number {
        let a = seedInt | 0;
        return function() {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // Deterministic shuffle: returns shuffled array and the mapping from original index -> new index
    public static shuffleWithMapping<T>(items: T[], seed: string): { shuffled: T[]; newIndexForOld: number[] } {
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
        const newIndexForOld = new Array<number>(items.length);
        pairs.forEach((p, newIdx) => {
            newIndexForOld[p.i] = newIdx;
        });

        return { shuffled, newIndexForOld };
    }

    /**
     * Convenience method: just returns the shuffled array for a given seed
     */
    public static shuffle<T>(items: T[], seed: string): T[] {
        return this.shuffleWithMapping(items, seed).shuffled;
    }

    /**
     * Derive a new seed string from an existing seed.
     * This is deterministic: given the same input seed and index the result will be the same.
     * Use the optional index to create a sequence of derived seeds (0,1,2...).
     * The output is a compact base36 representation of a 32-bit hash.
     */
    public static deriveNextSeed(seed: string, index = 0): string {
        // Ensure we always have a string base
        const input = (seed ?? '') + '|' + String(index);
        const next = this.hashSeed(input) >>> 0; // force unsigned
        // return a compact base36 representation
        return next.toString(36);
    }
}
