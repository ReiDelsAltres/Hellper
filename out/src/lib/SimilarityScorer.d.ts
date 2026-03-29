export interface ScoreResult {
    score: number;
    lengthMismatch: boolean;
    lengthRatio: number;
}
export default class SimilarityScorer {
    /**
     * Preloads the model so subsequent calls are fast.
     */
    static preload(): Promise<void>;
    /**
     * Score a user answer against reference answers and keywords.
     * Returns 0-100.
     *
     * @param userText   - the text the user typed
     * @param answers    - reference correct answers
     * @param keywords   - expected keywords
     */
    static score(userText: string, answers: string[], keywords: string[]): Promise<ScoreResult>;
}
//# sourceMappingURL=SimilarityScorer.d.ts.map