import { pipeline } from "@huggingface/transformers";
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";
let extractorPromise = null;
function getExtractor() {
    if (!extractorPromise) {
        extractorPromise = pipeline("feature-extraction", MODEL_NAME, {
            dtype: "fp32",
        });
    }
    return extractorPromise;
}
function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}
const embeddingCache = new Map();
const MAX_CACHE_SIZE = 500;
async function embed(text) {
    const cached = embeddingCache.get(text);
    if (cached)
        return cached;
    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    const result = Array.from(output.data);
    if (embeddingCache.size >= MAX_CACHE_SIZE) {
        const firstKey = embeddingCache.keys().next().value;
        embeddingCache.delete(firstKey);
    }
    embeddingCache.set(text, result);
    return result;
}
export default class SimilarityScorer {
    /**
     * Preloads the model so subsequent calls are fast.
     */
    static async preload() {
        await getExtractor();
    }
    /**
     * Score a user answer against reference answers and keywords.
     * Returns 0-100.
     *
     * @param userText   - the text the user typed
     * @param answers    - reference correct answers
     * @param keywords   - expected keywords
     */
    static async score(userText, answers, keywords) {
        const trimmed = userText.trim();
        if (trimmed.length === 0)
            return { score: 0, lengthMismatch: true, lengthRatio: 0 };
        // Length check against the closest reference answer
        let lengthRatio = 1;
        let lengthMismatch = false;
        if (answers.length > 0) {
            const avgRefLength = answers.reduce((sum, a) => sum + a.length, 0) / answers.length;
            lengthRatio = avgRefLength > 0 ? trimmed.length / avgRefLength : 1;
            lengthMismatch = lengthRatio < 0.7;
        }
        // Keyword matching component (0..1)
        let keywordScore = 0;
        if (keywords.length > 0) {
            const lower = trimmed.toLowerCase();
            const matched = keywords.filter(kw => lower.includes(kw.toLowerCase())).length;
            keywordScore = matched / keywords.length;
        }
        // Semantic similarity component (0..1)
        let semanticScore = 0;
        if (answers.length > 0) {
            const userEmbedding = await embed(trimmed);
            let maxSim = 0;
            for (const ans of answers) {
                const ansEmbedding = await embed(ans);
                const sim = cosineSimilarity(userEmbedding, ansEmbedding);
                if (sim > maxSim)
                    maxSim = sim;
            }
            // Remap: similarity < 0.25 → 0, > 0.75 → 1
            semanticScore = Math.max(0, Math.min(1, (maxSim - 0.25) / 0.5));
        }
        else {
            // No reference answers — rely only on keywords
            return { score: Math.round(keywordScore * 100), lengthMismatch, lengthRatio };
        }
        // Combine: 75% semantic, 25% keywords (if keywords present)
        let finalScore;
        if (keywords.length > 0) {
            finalScore = semanticScore * 0.75 + keywordScore * 0.25;
        }
        else {
            finalScore = semanticScore;
        }
        return { score: Math.round(finalScore * 100), lengthMismatch, lengthRatio };
    }
}
//# sourceMappingURL=SimilarityScorer.js.map