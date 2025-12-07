export default class SeededShuffle {
    static hashSeed(seed: string): number;
    static mulberry32(seedInt: number): () => number;
    static shuffleWithMapping<T>(items: T[], seed: string): {
        shuffled: T[];
        newIndexForOld: number[];
    };
    /**
     * Convenience method: just returns the shuffled array for a given seed
     */
    static shuffle<T>(items: T[], seed: string): T[];
    /**
     * Derive a new seed string from an existing seed.
     * This is deterministic: given the same input seed and index the result will be the same.
     * Use the optional index to create a sequence of derived seeds (0,1,2...).
     * The output is a compact base36 representation of a 32-bit hash.
     */
    static deriveNextSeed(seed: string, index?: number): string;
}
//# sourceMappingURL=SeededShuffle.d.ts.map