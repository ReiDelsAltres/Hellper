export interface ScoreBreakdown {
    semanticScore: number;
    semanticMax: number;
    logicalScore: number;
    logicalMax: number;
    keywordScore: number;
    keywordMax: number;
}
export interface ScoreResult {
    score: number;
    lengthMismatch: boolean;
    lengthRatio: number;
    breakdown: ScoreBreakdown;
}
export default class SimilarityScorer {
    /**
     * Preloads the model so subsequent calls are fast.
     */
    static preload(): Promise<void>;
    /**
     * Score a user answer against reference answers, keywords, and the question itself.
     * Returns 0-100.
     *
     * @param userText       - the text the user typed
     * @param answers        - reference correct answers
     * @param keywords       - expected keywords
     * @param questionTitle  - the question title (unused, kept for compatibility)
     * @param idealSize      - ideal answer length in characters (from "size" field)
     */
    static score(userText: string, answers: string[], keywords: string[], questionTitle?: string, idealSize?: number): Promise<ScoreResult>;
    private static scoreKeywords;
}
//# sourceMappingURL=SimilarityScorer.d.ts.map