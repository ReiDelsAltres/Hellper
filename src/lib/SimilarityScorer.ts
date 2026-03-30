import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor(): Promise<FeatureExtractionPipeline> {
    if (!extractorPromise) {
        extractorPromise = pipeline("feature-extraction", MODEL_NAME, {
            dtype: "fp32",
        }) as unknown as Promise<FeatureExtractionPipeline>;
    }
    return extractorPromise;
}

function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

const STOP_WORDS = new Set([
    "и", "в", "на", "с", "по", "к", "от", "из", "за", "у", "о", "об", "для", "до",
    "не", "что", "как", "это", "а", "но", "или", "так", "же", "ещё", "еще", "при",
    "то", "бы", "ли", "он", "она", "оно", "они", "его", "её", "их", "мы", "вы",
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "in", "on", "at", "to", "for", "of", "with", "by", "from", "as",
    "and", "or", "but", "not", "no", "this", "that", "it", "its",
]);

function tokenize(text: string): string[] {
    return text.toLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

/** Split text into sentences for granular comparison */
function splitSentences(text: string): string[] {
    return text
        .split(/(?<=[.!?;])\s+|(?<=\n)/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
}

/**
 * Embedding-based factual coverage: for each reference answer separately,
 * measures how well the user's text covers its sentences via semantic similarity.
 * Returns the best (max) per-answer coverage score (0..1).
 */
function nonsensePenalty(userText: string): number {
    const text = userText.trim();
    if (text.length === 0) return 0;

    // Very large repeats: AAAAAAAA или 111111 etc.
    if (/(.)\1{8,}/u.test(text)) {
        return 0.75;
    }

    const tokens = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
    if (tokens.length === 0) return 0.6;

    const repeatTokens = tokens.filter(tok => /^(.)\1+$/u.test(tok)).length;
    if (repeatTokens / tokens.length > 0.3) {
        return 0.6;
    }

    const nonMeaningfulTokens = tokens.filter(tok => tok.length <= 2).length;
    if (nonMeaningfulTokens / tokens.length > 0.5) {
        return 0.4;
    }

    return 0;
}

async function embeddingCoverage(userText: string, references: string[]): Promise<number> {
    if (references.length === 0) return 0;

    // Split user text into sentences for fine-grained matching
    const userSentences = splitSentences(userText);
    if (userSentences.length === 0) userSentences.push(userText);

    const userEmbeddings = await Promise.all(userSentences.map(s => embed(s)));
    // Also embed the full user text for whole-to-sentence comparison
    const fullUserEmb = await embed(userText);

    let bestAnswerScore = 0;

    for (const ref of references) {
        const refSentences = splitSentences(ref);
        if (refSentences.length === 0) refSentences.push(ref);

        let answerTotal = 0;
        for (const refSent of refSentences) {
            const refEmb = await embed(refSent);
            // Find best matching: user sentence OR full user text
            let bestSim = cosineSimilarity(fullUserEmb, refEmb);
            for (const userEmb of userEmbeddings) {
                const sim = cosineSimilarity(userEmb, refEmb);
                if (sim > bestSim) bestSim = sim;
            }
            // Remap: sim < 0.45 → 0, sim > 0.80 → 1, power for higher quality
            const raw = Math.max(0, Math.min(1, (bestSim - 0.45) / 0.35));
            answerTotal += Math.pow(raw, 1.3);
        }

        const answerScore = answerTotal / refSentences.length;
        if (answerScore > bestAnswerScore) bestAnswerScore = answerScore;
    }

    const baseScore = bestAnswerScore;
    const penalty = nonsensePenalty(userText);
    const adjustedScore = Math.max(0, baseScore * (1 - penalty));

    // Slightly ease reaching good logical score for real answers
    return Math.min(1, adjustedScore * 1.06 + 0.04);
}

const embeddingCache = new Map<string, number[]>();
const MAX_CACHE_SIZE = 500;

async function embed(text: string): Promise<number[]> {
    const cached = embeddingCache.get(text);
    if (cached) return cached;

    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    const result = Array.from(output.data as Float32Array);

    if (embeddingCache.size >= MAX_CACHE_SIZE) {
        const firstKey = embeddingCache.keys().next().value;
        embeddingCache.delete(firstKey);
    }
    embeddingCache.set(text, result);

    return result;
}

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
    static async preload(): Promise<void> {
        await getExtractor();
    }

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
    static async score(
        userText: string,
        answers: string[],
        keywords: string[],
        questionTitle?: string,
        idealSize?: number,
    ): Promise<ScoreResult> {
        const trimmed = userText.trim();
        const emptyBreakdown: ScoreBreakdown = { semanticScore: 0, semanticMax: 0, logicalScore: 0, logicalMax: 0, keywordScore: 0, keywordMax: 0 };
        if (trimmed.length === 0) return { score: 0, lengthMismatch: true, lengthRatio: 0, breakdown: emptyBreakdown };

        // Length check against idealSize or fallback to average reference length
        let lengthRatio = 1;
        let lengthMismatch = false;
        if (idealSize && idealSize > 0) {
            lengthRatio = trimmed.length / idealSize;
            lengthMismatch = lengthRatio < 0.7;
        } else if (answers.length > 0) {
            const avgRefLength = answers.reduce((sum, a) => sum + a.length, 0) / answers.length;
            lengthRatio = avgRefLength > 0 ? trimmed.length / avgRefLength : 1;
            lengthMismatch = lengthRatio < 0.7;
        }

        // Fuzzy keyword matching via embeddings (0..1)
        // Each keyword is matched by exact substring OR semantic similarity,
        // so "CPU" matches text about "процессор", "центральный процессор", etc.
        let keywordScore = 0;
        if (keywords.length > 0) {
            const lower = trimmed.toLowerCase();
            const userEmbedding = await embed(trimmed);
            let totalKw = 0;
            for (const kw of keywords) {
                // Exact substring match = full credit
                if (lower.includes(kw.toLowerCase())) {
                    totalKw += 1;
                    continue;
                }
                // Semantic similarity between keyword and user text
                const kwEmb = await embed(kw);
                const sim = cosineSimilarity(userEmbedding, kwEmb);
                // sim < 0.3 → 0, sim >= 0.55 → 1, linear in between
                if (sim > 0.3) {
                    totalKw += Math.min(1, (sim - 0.3) / 0.25);
                }
            }
            keywordScore = totalKw / keywords.length;
        }

        // Semantic similarity to reference answers (0..1)
        let semanticScore = 0;
        if (answers.length > 0) {
            const userEmbedding = await embed(trimmed);
            let maxSim = 0;
            for (const ans of answers) {
                const ansEmbedding = await embed(ans);
                const sim = cosineSimilarity(userEmbedding, ansEmbedding);
                if (sim > maxSim) maxSim = sim;
            }
            // Remap: similarity < 0.45 → 0, > 0.85 → 1, then power curve to suppress weak matches
            const raw = Math.max(0, Math.min(1, (maxSim - 0.45) / 0.40));
            semanticScore = Math.pow(raw, 1.5);
        } else {
            const kwOnly = Math.round(keywordScore * 100);
            return { score: kwOnly, lengthMismatch, lengthRatio, breakdown: { ...emptyBreakdown, keywordScore: kwOnly, keywordMax: 100 } };
        }

        // Logical / factual analysis via embedding-based coverage (0..1)
        // Splits references into sentences, embeds each, measures how well user covers them
        const logicalScore = await embeddingCoverage(trimmed, answers);

        // Combine: 35% semantic, 40% logical, 25% keywords (or 45/55 without keywords)
        let finalScore: number;
        let semMax: number, logMax: number, kwMax: number;
        if (keywords.length > 0) {
            semMax = 35; logMax = 40; kwMax = 25;
            finalScore = semanticScore * 0.35 + logicalScore * 0.40 + keywordScore * 0.25;
        } else {
            semMax = 45; logMax = 55; kwMax = 0;
            finalScore = semanticScore * 0.45 + logicalScore * 0.55;
        }

        const breakdown: ScoreBreakdown = {
            semanticScore: Math.round(semanticScore * semMax),
            semanticMax: semMax,
            logicalScore: Math.round(logicalScore * logMax),
            logicalMax: logMax,
            keywordScore: Math.round(keywordScore * kwMax),
            keywordMax: kwMax,
        };

        return { score: Math.round(finalScore * 100), lengthMismatch, lengthRatio, breakdown };
    }
}
