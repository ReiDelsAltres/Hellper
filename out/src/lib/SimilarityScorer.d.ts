export interface ScoreBreakdown {
    similarity: number;
    coverage: number;
    keyword: number;
    hasKeywords: boolean;
    /** Multiplicative confidence modifier applied to the final score (1.0 = no change) */
    confidenceModifier: number;
    criticalError: boolean;
    /** Whether a short-answer augmentation was applied to the user text */
    augmented: boolean;
    /** True when user numbers contradict numeric constraints in references */
    numericMismatch: boolean;
    /** Per-component bonus percentages (0 if not applied) */
    similarityBonusPercent: number;
    coverageBonusPercent: number;
    keywordBonusPercent: number;
    /** Combined multiplier from bonuses, e.g. 1.2 when one bonus of 20% applied */
    bonusMultiplier: number;
    /** Weighted contribution of each stage to the total score */
    similarityWeight: number;
    coverageWeight: number;
    keywordWeight: number;
}
export interface ScoreResult {
    score: number;
    lengthMismatch: boolean;
    lengthRatio: number;
    breakdown: ScoreBreakdown;
}
export default class SimilarityScorer {
    static preload(): Promise<void>;
    static score(userText: string, answers: string[], keywords: string[], _questionTitle?: string, idealSize?: number): Promise<ScoreResult>;
}
//# sourceMappingURL=SimilarityScorer.d.ts.map