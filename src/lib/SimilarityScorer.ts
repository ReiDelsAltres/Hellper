import type { FeatureExtractionPipeline, TokenClassificationPipeline } from "@huggingface/transformers";

// ===== Models =====
const EMBEDDING_MODEL = "Xenova/multilingual-e5-small";
//const NLI_MODEL = "Xenova/bert-base-multilingual-cased-ner-hrl";

// ===== Tunable Parameters =====
const PARAMS = {
    length: {
        mismatchThreshold: 0.7,
    },
    similarity: {
        low: 0.65,
        high: 0.90,
        power: 2.0,
        // Minimum fraction of reference words that should match before
        // allowing very high similarity scores.
        minWordRecall: 0.25,
        // Cosine threshold above which wordRecall requirement is enforced
        highRequire: 0.80,
        // Scaling factor for hard penalty when wordRecall < minWordRecall
        hardPenaltyScale: 0.5,
    },
    coverage: {
        low: 0.80,
        high: 0.93,
        power: 2.5,
    },
    keywords: {
        low: 0.3,
        high: 0.8,
    },
    nli: {
        criticalThreshold: 0.15,
        maxSentences: 10,
    },
    weights: {
        similarity: (1 / 3),
        coverage: (1 / 3),
        keyword: (1 / 3),

        similarityNoKw: (1 / 2),
        coverageNoKw: (1 / 2),
    },
};

// ===== Lazy-loaded transformers module =====
let transformersModule: typeof import("@huggingface/transformers") | null = null;
let transformersPromise: Promise<typeof import("@huggingface/transformers")> | null = null;

async function getTransformers(): Promise<typeof import("@huggingface/transformers")> {
    if (transformersModule) return transformersModule;
    return transformersPromise ??= (async () => {
        const mod = await import("@huggingface/transformers");
        mod.env.useBrowserCache = false;
        mod.env.useCustomCache = true;
        (mod.env as any).customCache = {
            async match(request: Request) {
                const cache = await caches.open('transformers-cache');
                return cache.match(request);
            },
            async put(_request: Request, _response: Response) { },
        };
        mod.env.allowLocalModels = false;
        mod.env.allowRemoteModels = true;
        transformersModule = mod;
        return mod;
    })();
}

// ===== Model Singletons =====
let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;
let nliPipelinePromise: Promise<TokenClassificationPipeline> | null = null;

function getExtractor(): Promise<FeatureExtractionPipeline> {
    return extractorPromise ??= (async () => {
        const { pipeline } = await getTransformers();
        return pipeline("feature-extraction", EMBEDDING_MODEL, {
            dtype: "q8",
        }) as unknown as FeatureExtractionPipeline;
    })();
}

/*function getTokenClassificationPipeline(): Promise<TokenClassificationPipeline> {
    return nliPipelinePromise ??= (async () => {
        const { pipeline } = await getTransformers();
        return pipeline("token-classification", NLI_MODEL, {
            dtype: "q4",
        }) as unknown as TokenClassificationPipeline;
    })();
}*/

// ===== Embedding Cache =====
const embeddingCache = new Map<string, number[]>();
const MAX_CACHE_SIZE = 500;

async function embed(text: string): Promise<number[]> {
    const cached = embeddingCache.get(text);
    if (cached) return cached;

    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    const result = Array.from(output.data as Float32Array);

    if (embeddingCache.size >= MAX_CACHE_SIZE) {
        embeddingCache.delete(embeddingCache.keys().next().value as string);
    }
    embeddingCache.set(text, result);
    return result;
}

function cosine(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

function splitSentences(text: string): string[] {
    return text
        .split(/(?<=[.!?;])\s+|(?<=\n)/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
}

function remap(value: number, low: number, high: number, power: number): number {
    const raw = Math.max(0, Math.min(1, (value - low) / (high - low)));
    return Math.pow(raw, power);
}

// ----- Text normalization utilities: stopwords + lightweight lemmatizer/stemming -----
const STOPWORDS = new Set<string>([
    // Russian common stopwords (partial)
    'и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то', 'все', 'она', 'так', 'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по', 'ее', 'мне', 'было', 'вот', 'от', 'меня', 'еще', 'нет', 'о', 'из', 'ему', 'теперь', 'когда', 'даже', 'ну', 'вдруг', 'ли', 'если', 'уже', 'или', 'ни', 'быть', 'был', 'него', 'до', 'вас', 'нибудь', 'опять', 'уж', 'вам', 'такой', 'тогда', 'который', 'этот', 'того', 'потому', 'этого', 'какой', 'совсем', 'ним', 'здесь', 'этом', 'один', 'почти', 'мой', 'тем', 'чтобы', 'нее', 'сейчас', 'были', 'куда', 'зачем', 'при', 'всех', 'ничего', 'раз', 'только', 'больше', 'менее', 'сам',
    // English common stopwords (partial)
    'the', 'and', 'is', 'in', 'it', 'you', 'of', 'for', 'on', 'with', 'as', 'this', 'that', 'a', 'an', 'are', 'be', 'was', 'were', 'to', 'from', 'by', 'or', 'at', 'which', 'but', 'have', 'has', 'had'
]);

function normalizeRaw(word: string): string {
    return word.toLowerCase().replace(/ё/g, 'е').replace(/[^а-яёa-z0-9\-]/g, '');
}

function normalizeWord(word: string): string {
    let w = normalizeRaw(word);
    if (!w) return '';

    // simple suffix stripping (Russian+English common endings)
    const suffixes = [
        'иями', 'ями', 'иями', 'ями', 'ями', 'анием', 'ение', 'ения', 'иями', 'ями', 'ами', 'ями', 'ости', 'ость', 'ости', 'ость',
        'ого', 'его', 'ому', 'ему', 'ая', 'ое', 'ые', 'ые', 'ым', 'им', 'ых', 'их', 'ами', 'ями', 'ах', 'ях', 'ия', 'ии', 'ие', 'ий', 'ья', 'ье',
        'ом', 'ем', 'ой', 'ый', 'ой', 'ые', 'ах', 'ях', 'ам', 'ям', 'ов', 'ев', 'ий', 'ый', 'ая', 'ам', 'ам', 'ов', 'ев',
        'tion', 'ing', 'ed', 's'
    ];
    for (const suf of suffixes) {
        if (w.length - suf.length >= 3 && w.endsWith(suf)) {
            w = w.slice(0, w.length - suf.length);
            break;
        }
    }

    // final cleanup
    w = w.replace(/[^а-яёa-z0-9]/g, '');
    return w;
}

function tokenizeWords(text: string): string[] {
    const raw = (text.match(/[а-яёa-z]{3,}/gi) ?? []);
    const out: string[] = [];
    for (const w of raw) {
        const n = normalizeWord(w);
        if (!n) continue;
        if (STOPWORDS.has(n)) continue;
        out.push(n);
    }
    return [...new Set(out)];
}

function extractNumbers(text: string): number[] {
    const raw = text.match(/\d+(?:[.,]\d+)?/g) ?? [];
    const nums: number[] = [];
    for (const r of raw) {
        const n = Number(r.replace(',', '.'));
        if (!Number.isNaN(n)) nums.push(n);
    }
    return nums;
}

function numberEq(a: number, b: number): boolean {
    return Math.abs(a - b) < 1e-6;
}

function numericConstraintSatisfied(userNums: number[], referenceText: string): boolean {
    const refNums = extractNumbers(referenceText);
    if (!refNums.length) return true;

    const text = referenceText.toLowerCase();
    const range1 = text.match(/от\s+(\d+(?:[.,]\d+)?)\s+до\s+(\d+(?:[.,]\d+)?)/);
    const range2 = text.match(/(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)/);

    if (range1 || range2) {
        const source = range1 ?? range2;
        const min = Number((source?.[1] ?? '0').replace(',', '.'));
        const max = Number((source?.[2] ?? '0').replace(',', '.'));
        return userNums.some(un => un >= min && un <= max);
    }

    const gtePhrases = ['не менее', 'не меньше', 'минимум', 'как минимум', 'не менее чем', 'по крайней мере', 'at least', 'minimum'];
    const ltePhrases = ['не более', 'не больше', 'максимум', 'не превышает', 'не превышать', 'at most', 'maximum'];
    const hasGte = gtePhrases.some(p => text.includes(p));
    const hasLte = ltePhrases.some(p => text.includes(p));

    const refVal = refNums[0];
    if (hasGte) return userNums.some(un => un >= refVal);
    if (hasLte) return userNums.some(un => un <= refVal);

    // Default numeric rule: at least one number must match exactly.
    return userNums.some(un => refNums.some(rn => numberEq(un, rn)));
}

function evaluateNumericConsistency(userText: string, answers: string[]): { factor: number; mismatch: boolean } {
    const userNums = extractNumbers(userText);
    if (!userNums.length) return { factor: 1.0, mismatch: false };

    const numericAnswers = answers.filter(a => extractNumbers(a).length > 0);
    if (!numericAnswers.length) return { factor: 1.0, mismatch: false };

    for (const a of numericAnswers) {
        if (numericConstraintSatisfied(userNums, a)) return { factor: 1.0, mismatch: false };
    }

    // Strong penalty for contradictory numeric facts (e.g., 29 instead of 28).
    return { factor: 0.55, mismatch: true };
}

// ===== Stage 1: Length Check =====
function checkLength(
    text: string, answers: string[], idealSize?: number,
): { lengthRatio: number; lengthMismatch: boolean } {
    let lengthRatio = 1;
    if (idealSize && idealSize > 0) {
        lengthRatio = text.length / idealSize;
    } else if (answers.length > 0) {
        const avg = answers.reduce((s, a) => s + a.length, 0) / answers.length;
        lengthRatio = avg > 0 ? text.length / avg : 1;
    }
    return { lengthRatio, lengthMismatch: lengthRatio < PARAMS.length.mismatchThreshold };
}

// ===== Stage 2: Semantic-Logic Score =====

/** Direct cosine similarity: user text vs each reference as a whole (0..1) */
async function directSimilarity(userText: string, answers: string[]): Promise<number> {
    const userEmb = await embed(userText);

    // Tokenize + normalize user words (stopwords removed) and their embeddings
    const userWords = tokenizeWords(userText);
    const userWordEmbs = userWords.length ? await Promise.all(userWords.map(embed)) : [];

    let max = 0;
    for (const ans of answers) {
        const ansEmb = await embed(ans);
        const cosSim = cosine(userEmb, ansEmb);
        const cosScore = remap(cosSim, PARAMS.similarity.low, PARAMS.similarity.high, PARAMS.similarity.power);

        // Per-word recall: tokenize reference words (normalized)
        const refWords = tokenizeWords(ans);
        let wordRecall = 1.0;
        if (refWords.length > 0) {
            if (userWordEmbs.length === 0) {
                wordRecall = 0;
            } else {
                const refWordEmbs = await Promise.all(refWords.map(embed));
                let totalWordScore = 0;
                for (let ri = 0; ri < refWords.length; ri++) {
                    const refWord = refWords[ri];
                    if (userWords.includes(refWord)) {
                        totalWordScore += 1.0;
                    } else {
                        let bestWordSim = 0;
                        for (const uEmb of userWordEmbs) {
                            const s = cosine(uEmb, refWordEmbs[ri]);
                            if (s > bestWordSim) bestWordSim = s;
                        }
                        // Strong semantic matches only (threshold 0.85), map to 0..1
                        const semScore = bestWordSim > 0.85 ? Math.min(1, (bestWordSim - 0.85) / 0.15) : 0;
                        totalWordScore += semScore;
                    }
                }
                wordRecall = totalWordScore / refWords.length;
            }
        } else {
            wordRecall = 1.0;
        }

        // Multiplicative penalty — reduces cosine-based similarity when many words differ
        const penaltyFactor = 0.4 + 0.6 * wordRecall; // ranges 0.4..1.0
        let score = cosScore * penaltyFactor;

        // Hard requirement: if cosine is high but wordRecall is below minimum,
        // apply an additional harsher penalty so topic-only matches don't yield max scores.
        const minRecall = (PARAMS.similarity as any).minWordRecall ?? 0.25;
        const highReq = (PARAMS.similarity as any).highRequire ?? 0.80;
        const hardScale = (PARAMS.similarity as any).hardPenaltyScale ?? 0.5;
        if (cosScore >= highReq && wordRecall < minRecall) {
            const ratio = wordRecall / Math.max(1e-6, minRecall);
            const hardPenalty = Math.max(0.1, ratio * hardScale);
            score *= hardPenalty;
        }

        if (score > max) max = score;
    }

    return Math.min(1, max);
}

/** Sentence-level coverage: how well user text covers reference sentences (0..1) */
async function sentenceCoverage(userText: string, answers: string[]): Promise<number> {
    if (answers.length === 0) return 0;

    const userSents = splitSentences(userText);
    if (userSents.length === 0) userSents.push(userText);

    const userEmbs = await Promise.all(userSents.map(embed));
    const fullEmb = await embed(userText);
    let bestAnswer = 0;

    for (const ref of answers) {
        const refSents = splitSentences(ref);
        if (refSents.length === 0) refSents.push(ref);

        let total = 0;
        for (const refSent of refSents) {
            const refEmb = await embed(refSent);
            let best = cosine(fullEmb, refEmb);
            for (const uEmb of userEmbs) {
                const sim = cosine(uEmb, refEmb);
                if (sim > best) best = sim;
            }
            total += remap(best, PARAMS.coverage.low, PARAMS.coverage.high, PARAMS.coverage.power);
        }

        const score = total / refSents.length;
        if (score > bestAnswer) bestAnswer = score;
    }

    return Math.min(1, bestAnswer);
}

/** Keyword matching: exact match or semantic fallback (0..1) */
async function keywordScore(userText: string, keywords: string[]): Promise<number> {
    if (keywords.length === 0) return 0;

    const parts = userText.split(/[.!?]/);
    const userTokens = new Set(tokenizeWords(userText));

    const partEmbs = await Promise.all(parts.map(embed));
    const kwEmbs = await Promise.all(keywords.map(embed));

    let total = 0;

    for (let i = 0; i < keywords.length; i++) {
        const kwLower = keywords[i].toLowerCase();
        const kwTokens = tokenizeWords(kwLower);
        if (kwTokens.length > 0) {
            let overlapCount = 0;
            for (const t of kwTokens) if (userTokens.has(t)) overlapCount++;
            const overlap = overlapCount / kwTokens.length;

            // Strong lexical match for keyword phrase
            if (overlap >= 1) {
                total += 1;
                continue;
            }

            // Partial lexical match for multi-word keyword
            if (kwTokens.length > 1 && overlap >= 0.66) {
                total += 0.85;
                continue;
            }
        }

        const kwNorm = normalizeWord(kwLower);
        if (kwNorm && userTokens.has(kwNorm)) {
            total += 1;
            continue;
        }

        const sim = Math.max(
            ...partEmbs.map(e => cosine(e, kwEmbs[i]))
        );

        const t = Math.max(0, Math.min(1, (sim - 0.75) / (0.90 - 0.75)));
        total += Math.pow(t, 3);
    }

    return total / keywords.length;
}

/** Combined semantic-logic score from similarity + coverage + keywords */
async function computeSemanticLogicScore(
    userText: string,
    answers: string[],
    keywords: string[],
): Promise<{ score: number; similarity: number; coverage: number; kw: number; augmented?: boolean; effectiveText?: string; numericMismatch?: boolean }> {

    // Short-answer overrides: detect numeric answers, acronyms, or exact-token subset
    function computeShortAnswerOverride(uText: string, answersList: string[], kws: string[]) : { similarity?: number; coverage?: number; kw?: number; reason?: string; augment?: string } | null {
        const userNums = extractNumbers(uText);
        const userTokens = tokenizeWords(uText);
        const userTokenSet = new Set(userTokens);
        const keywordGroups = (kws || []).map(k => tokenizeWords(k)).filter(g => g.length > 0);
        const keywordFlat = new Set(keywordGroups.flat());

        const calcOverlap = (group: string[]): number => {
            let hits = 0;
            for (const t of group) if (userTokenSet.has(t)) hits++;
            return group.length > 0 ? hits / group.length : 0;
        };

        // Numeric answers: strong signal — allow augmentation (append matching ref fragment)
        if (userNums.length) {
            for (const a of answersList) {
                const refNums = extractNumbers(a).map(n => Number(n));
                const text = a.toLowerCase();

                const rangeMatch1 = text.match(/от\s+(\d+)\s+до\s+(\d+)/);
                const rangeMatch2 = text.match(/(\d+)\s*[-–]\s*(\d+)/);
                if (rangeMatch1) {
                    const min = Number(rangeMatch1[1]);
                    const max = Number(rangeMatch1[2]);
                    if (userNums.some(un => Number(un) >= min && Number(un) <= max))
                        return { similarity: 0.85, coverage: 0.8, kw: 1.0, reason: 'numeric-range', augment: `${a}` };
                    continue;
                }
                if (rangeMatch2) {
                    const min = Number(rangeMatch2[1]);
                    const max = Number(rangeMatch2[2]);
                    if (userNums.some(un => Number(un) >= min && Number(un) <= max))
                        return { similarity: 0.85, coverage: 0.8, kw: 1.0, reason: 'numeric-range', augment: `${a}` };
                    continue;
                }

                const gtePhrases = ['не менее', 'не меньше', 'минимум', 'как минимум', 'не менее чем', 'по крайней мере', 'at least', 'minimum'];
                const ltePhrases = ['не более', 'не больше', 'максимум', 'не превышает', 'не превышать', 'at most', 'maximum'];

                const hasGte = gtePhrases.some(p => text.includes(p));
                const hasLte = ltePhrases.some(p => text.includes(p));

                if (refNums.length) {
                    const refVal = refNums[0];
                    if (hasGte) {
                        if (userNums.some(un => Number(un) >= refVal))
                            return { similarity: 0.85, coverage: 0.8, kw: 1.0, reason: 'numeric-gte', augment: `${a}` };
                    } else if (hasLte) {
                        if (userNums.some(un => Number(un) <= refVal))
                            return { similarity: 0.85, coverage: 0.8, kw: 1.0, reason: 'numeric-lte', augment: `${a}` };
                    } else {
                        if (userNums.some(un => Number(un) === refVal))
                            return { similarity: 0.85, coverage: 0.8, kw: 1.0, reason: 'numeric-eq', augment: `${a}` };
                    }
                }
            }
        }

        // Keyword-first logic: exact/strong partial matches should have priority over generic subset.
        if (keywordGroups.length > 0 && userTokens.length > 0) {
            let bestIdx = -1;
            let bestOverlap = 0;
            for (let i = 0; i < keywordGroups.length; i++) {
                const ov = calcOverlap(keywordGroups[i]);
                if (ov > bestOverlap) {
                    bestOverlap = ov;
                    bestIdx = i;
                }
            }

            if (bestIdx >= 0) {
                const bestGroup = keywordGroups[bestIdx];
                const shortEnough = userTokens.length <= Math.max(7, bestGroup.length + 3);
                if (bestOverlap >= 1 && shortEnough) {
                    return { similarity: 0.92, coverage: 0.9, kw: 1.0, reason: 'keyword-exact' };
                }
                if (bestOverlap >= 0.66 && shortEnough) {
                    return { similarity: 0.78, coverage: 0.75, kw: 0.92, reason: 'keyword-partial' };
                }
                // Morphology-tolerant partial for long keyword phrases (e.g. generic form of a 3+ word concept)
                if (bestGroup.length >= 3 && bestOverlap >= 0.5 && shortEnough) {
                    return { similarity: 0.72, coverage: 0.68, kw: 0.82, reason: 'keyword-partial-loose' };
                }
            }
        }

        for (const a of answersList) {
            const refTokens = tokenizeWords(a);

            // Acronym match — allow augmentation with expanded tokens
            const acronym = refTokens.map(t => t[0]).join('').toLowerCase();
            const userNorm = normalizeRaw(uText).toLowerCase();
            if (userNorm && (userNorm === acronym || userTokens.includes(acronym))) {
                return { similarity: 0.8, coverage: 0.75, kw: 1.0, reason: 'acronym', augment: `${refTokens.join(' ')}` };
            }

            // Exact token subset: modest boost (no augmentation)
            if (userTokens.length > 0 && userTokens.every(t => refTokens.includes(t))) {
                const cov = Math.min(1, 0.5 + (userTokens.length / Math.max(1, refTokens.length)));
                const kwv = keywordGroups.length && userTokens.some(u => keywordFlat.has(u)) ? 1.0 : 0.8;
                return { similarity: 0.75, coverage: cov, kw: kwv, reason: 'subset' };
            }
        }

        return null;
    }

    // Short-answer override: may provide conservative suggestions and an optional safe augmentation
    const shortOverride = computeShortAnswerOverride(userText, answers, keywords);

    // Decide whether to augment the user text (only when override suggests a safe augment)
    let effectiveText = userText;
    let usedAugment = false;
    if (shortOverride && (shortOverride as any).augment) {
        const reason = (shortOverride as any).reason ?? '';
        const simOverride = (shortOverride as any).similarity ?? 0;
        // Allow augment when similarity suggestion is strong, or when keyword exactly matches user text
        let augmentOk = false;
        if (reason === 'keyword-present' && typeof (shortOverride as any).augment === 'string') {
            const augNorm = normalizeWord(((shortOverride as any).augment as string).toLowerCase());
            if (augNorm && normalizeWord(userText.toLowerCase()) === augNorm) augmentOk = true;
        }
        if (!augmentOk && simOverride >= 0.75) augmentOk = true;

        if (augmentOk) {
            const augStr = String((shortOverride as any).augment ?? '').trim();
            const augNorm = normalizeWord(augStr.toLowerCase());
            const userNorm = normalizeWord(userText.toLowerCase());
            if (augStr && augNorm && !userNorm.includes(augNorm)) {
                effectiveText = (userText + ' ' + augStr).trim();
                usedAugment = true;
            }
        }
    }

    let similarity = 0, coverage = 0, kw = 0;

    let overrideReason = '';

    if (usedAugment) {
        const [sRaw, cRaw, kRaw] = await Promise.all([
            directSimilarity(effectiveText, answers),
            sentenceCoverage(effectiveText, answers),
            keywordScore(effectiveText, keywords),
        ]);
        similarity = sRaw;
        coverage = cRaw;
        kw = kRaw;
    } else {
        const [sRaw, cRaw, kRaw] = await Promise.all([
            directSimilarity(userText, answers),
            sentenceCoverage(userText, answers),
            keywordScore(userText, keywords),
        ]);
        similarity = sRaw;
        coverage = cRaw;
        kw = kRaw;

        // If there's a short override, blend its conservative suggestions (no double-counting with augmentation)
        if (shortOverride) {
            const reason = (shortOverride as any).reason ?? '';
            overrideReason = reason;
            let alpha = 0.5;
            if (reason.startsWith('numeric')) alpha = 0.75;
            else if (reason === 'acronym') alpha = 0.6;
            else if (reason === 'subset') alpha = 0.6;
            else if (reason === 'keyword-partial') alpha = 0.78;
            else if (reason === 'keyword-partial-loose') alpha = 0.68;
            else if (reason === 'keyword-exact') alpha = 0.85;
            else if (reason === 'keyword-present') alpha = 0.5;

            const oSim = (shortOverride as any).similarity ?? similarity;
            const oCov = (shortOverride as any).coverage ?? coverage;
            const oKw = (shortOverride as any).kw ?? kw;

            similarity = Math.max(0, Math.min(1, similarity * (1 - alpha) + oSim * alpha));
            coverage = Math.max(0, Math.min(1, coverage * (1 - alpha) + oCov * alpha));
            kw = Math.max(0, Math.min(1, kw * (1 - alpha) + oKw * alpha));
        }
    }

    const w = PARAMS.weights;

    const base = keywords.length > 0
        ? similarity * w.similarity + coverage * w.coverage + kw * w.keyword
        : similarity * w.similarityNoKw + coverage * w.coverageNoKw;

    let penalty = Math.min(1, Math.min(similarity, coverage) + 0.2);
    if (overrideReason === 'keyword-partial') penalty = Math.max(penalty, 0.85);
    if (overrideReason === 'keyword-partial-loose') penalty = Math.max(penalty, 0.82);
    if (overrideReason === 'keyword-exact') penalty = Math.max(penalty, 0.92);
    const numeric = evaluateNumericConsistency(userText, answers);

    const score = base * penalty * numeric.factor;

    return { score, similarity, coverage, kw, augmented: usedAugment, effectiveText, numericMismatch: numeric.mismatch };
}

// ===== Stage 3: NLI Modifier =====

/*async function computeNLIModifier(
    userText: string, answers: string[],
): Promise<{ entailment: number; criticalError: boolean }> {

    try {
        const classifier = await getTokenClassificationPipeline();

        const refSentences: string[] = [];
        for (const ref of answers) {
            const sents = splitSentences(ref);
            refSentences.push(...(sents.length > 0 ? sents : [ref]));
        }
        if (refSentences.length === 0)
            return { entailment: 1.0, criticalError: false };

        const sentences = refSentences.slice(0, PARAMS.nli.maxSentences);

        const classify = async (premise: string, hypothesis: string) => {
            const r = await classifier(premise, [hypothesis], {
                hypothesis_template: "{}",
                multi_label: true,
            }) as unknown as { scores: number[] };
            return r.scores[0];
        };

        const forwardScores: number[] = [];
        const reverseScores: number[] = [];

        for (const sent of sentences) {
            const [fwd, rev] = await Promise.all([
                classify(sent, userText),
                classify(userText, sent),
            ]);
            forwardScores.push(fwd);
            reverseScores.push(rev);
        }

        const meanTopK = (arr: number[], k: number) => {
            const sorted = [...arr].sort((a, b) => b - a);
            const top = sorted.slice(0, k);
            return top.reduce((a, b) => a + b, 0) / top.length;
        };

        const fwdScore = meanTopK(forwardScores, 2);
        const revScore = meanTopK(reverseScores, 2);

        const combined = Math.min(fwdScore, revScore);

        const t = Math.max(0, Math.min(1, (combined - 0.6) / 0.3));
        const entailment = 0.5 + 0.75 * Math.pow(t, 2);

        const criticalError = combined < PARAMS.nli.criticalThreshold;

        return {
            entailment: Math.max(0.5, Math.min(1.2, entailment)),
            criticalError
        };

    } catch {
        return { entailment: 1.0, criticalError: false };
    }
}*/
async function computeConfidenceModifierAuto(
    userText: string,
    answers: string[],
    keywords: string[]
): Promise<number> {
    if (!answers.length) return 1.0;

    // 1. Семантика
    const sim = await directSimilarity(userText, answers);

    // 2. Покрытие
    const cov = await sentenceCoverage(userText, answers);

    // 3. Ключевые слова
    const kw = keywords.length > 0 ? await keywordScore(userText, keywords) : 1.0;

    // 4. Весовое среднее
    const w = { sim: 0.35, cov: 0.4, kw: 0.25 };
    const base = keywords.length > 0 ? sim * w.sim + cov * w.cov + kw * w.kw : sim * w.sim + cov * w.cov;

    // 5. Мягкое ремаппирование в диапазон 0.5–1.2
    const modifier = 0.5 + 0.7 * Math.pow(Math.min(1, base), 2);
    return Math.min(1.2, Math.max(0.5, modifier));
}
async function computeConfidenceModifierUnifiedSafe(
    userText: string,
    answers: string[],
    keywords: string[]
): Promise<number> {
    if (!answers.length || !userText.trim()) return 1.0;

    // --- 1. Семантика, покрытие, ключевые слова ---
    const [sim, cov, kw] = await Promise.all([
        answers.length > 0 ? directSimilarity(userText, answers) : Promise.resolve(1.0),
        answers.length > 0 ? sentenceCoverage(userText, answers) : Promise.resolve(1.0),
        keywords.length > 0 ? keywordScore(userText, keywords) : Promise.resolve(1.0)
    ]);

    const w = { sim: 0.35, cov: 0.4, kw: 0.25 };
    const base = !isNaN(sim) && !isNaN(cov) && !isNaN(kw)
        ? (keywords.length > 0 ? sim * w.sim + cov * w.cov + kw * w.kw : sim * w.sim + cov * w.cov)
        : 0.8;

    // --- 2. Длина ответа относительно эталона ---
    const avgLen = answers.length ? answers.reduce((s, a) => s + a.length, 0) / answers.length : 1;
    const lengthRatio = avgLen > 0 ? userText.length / avgLen : 1;
    const lengthMod = Math.min(1.2, Math.max(0.8, lengthRatio));

    // --- 3. Вариативность embeddings ---
    const userSents = splitSentences(userText);
    const userEmbs = userSents.length
        ? await Promise.all(userSents.map(embed))
        : [await embed(userText)];

    let totalVar = 0;
    for (const ref of answers) {
        const refSents = splitSentences(ref);
        const refEmbs = refSents.length ? await Promise.all(refSents.map(embed)) : [await embed(ref)];

        const sims: number[] = [];
        for (const u of userEmbs) for (const r of refEmbs) {
            const c = cosine(u, r);
            if (!isNaN(c)) sims.push(c);
        }

        if (sims.length) {
            const mean = sims.reduce((s, n) => s + n, 0) / sims.length;
            const varSim = sims.reduce((s, n) => s + Math.pow(n - mean, 2), 0) / sims.length;
            totalVar += varSim;
        }
    }

    const avgVar = answers.length ? totalVar / answers.length : 0;
    const varianceMod = Math.min(1.2, Math.max(0.7, 1 - avgVar));

    // --- 4. Комбинированный модификатор ---
    let modifier = base * lengthMod * varianceMod;

    // --- 5. Ремаппинг на новые пределы 0.6 → 1.5 ---
    const minMod = 0.6;
    const maxMod = 1.5;
    modifier = isNaN(modifier) ? 1.0 : minMod + (maxMod - minMod) * Math.min(1, Math.max(0, modifier));

    return modifier;
}

// ===== Public API =====

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

const EMPTY_BREAKDOWN: ScoreBreakdown = {
    similarity: 0, coverage: 0, keyword: 0,
    hasKeywords: false, confidenceModifier: 1, criticalError: false,
    augmented: false,
    numericMismatch: false,
    similarityBonusPercent: 0, coverageBonusPercent: 0, keywordBonusPercent: 0, bonusMultiplier: 1,
    similarityWeight: 0, coverageWeight: 0, keywordWeight: 0
};

export default class SimilarityScorer {

    static async preload(): Promise<void> { }

    // Enabling toggle removed: confidence modifier is always computed.

    static async score(
        userText: string,
        answers: string[],
        keywords: string[],
        _questionTitle?: string,
        idealSize?: number,
    ): Promise<ScoreResult> {
        const trimmed = userText.trim();
        if (trimmed.length === 0) {
            return { score: 0, lengthMismatch: true, lengthRatio: 0, breakdown: { ...EMPTY_BREAKDOWN } };
        }

        // Stage 1: Length
        const { lengthRatio, lengthMismatch } = checkLength(trimmed, answers, idealSize);

        if (answers.length === 0) {
            const kw = await keywordScore(trimmed, keywords);
            return {
                score: Math.round(kw * 100), lengthMismatch, lengthRatio,
                breakdown: { ...EMPTY_BREAKDOWN, keyword: Math.round(kw * 100), hasKeywords: keywords.length > 0, keywordWeight: 100 },
            };
        }

        // Stage 2: Semantic-Logic
        const sem = await computeSemanticLogicScore(trimmed, answers, keywords);

        // Stage 3: confidence modifier (always computed). This is a multiplicative modifier
        // applied to the final score (1.0 = no change). It is NOT a percent.
        let criticalError = false;
        const cmText = (sem as any).effectiveText && (sem as any).augmented ? (sem as any).effectiveText : trimmed;
        let confidenceModifier = await computeConfidenceModifierUnifiedSafe(cmText, answers, keywords);
        if ((sem as any).numericMismatch) {
            // Prevent contradictory numeric answers from being boosted by confidence modifier.
            confidenceModifier = Math.min(confidenceModifier, 0.85);
        }

        const finalScore = Math.min(1, Math.max(0.01, sem.score));

        // Bonus per component that reaches 100% (stackable). Each gives +20% by design.
        const hasKw = keywords.length > 0;
        const perBonus = 0.2;
        const similarityBonus = sem.similarity >= 1 ? perBonus : 0;
        const coverageBonus = sem.coverage >= 1 ? perBonus : 0;
        const keywordBonus = hasKw && sem.kw >= 1 ? perBonus : 0;
        const bonusMultiplier = 1.0 + similarityBonus + coverageBonus + keywordBonus;
        const scoredFinal = Math.min(1, finalScore * bonusMultiplier);

        // Apply confidence modifier (multiplier) and clamp
        const finalWithModifier = Math.min(1, Math.max(0, scoredFinal * confidenceModifier));

        const w = PARAMS.weights;
        const breakdown: ScoreBreakdown = {
            similarity: Math.round(sem.similarity * 100),
            coverage: Math.round(sem.coverage * 100),
            keyword: Math.round(sem.kw * 100),
            hasKeywords: hasKw,
            confidenceModifier,
            criticalError,
            augmented: !!(sem as any).augmented,
            numericMismatch: !!(sem as any).numericMismatch,
            similarityBonusPercent: Math.round(similarityBonus * 100),
            coverageBonusPercent: Math.round(coverageBonus * 100),
            keywordBonusPercent: Math.round(keywordBonus * 100),
            bonusMultiplier: Number(bonusMultiplier.toFixed(2)),
            similarityWeight: Math.round((hasKw ? w.similarity : w.similarityNoKw) * 100),
            coverageWeight: Math.round((hasKw ? w.coverage : w.coverageNoKw) * 100),
            keywordWeight: hasKw ? Math.round(w.keyword * 100) : 0
        };

        return { score: Math.round(finalWithModifier * 100), lengthMismatch, lengthRatio, breakdown };
    }
}
