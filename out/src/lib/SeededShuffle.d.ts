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
}
//# sourceMappingURL=SeededShuffle.d.ts.map