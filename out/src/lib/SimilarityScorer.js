import LanguageUtility from "./LanguageUtility.js";
import SemanticString from "./SemanticString.js";
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
let transformersModule = null;
let transformersPromise = null;
async function getTransformers() {
    if (transformersModule)
        return transformersModule;
    return transformersPromise ??= (async () => {
        const mod = await import("@huggingface/transformers");
        mod.env.useBrowserCache = false;
        mod.env.useCustomCache = true;
        mod.env.customCache = {
            async match(request) {
                const cache = await caches.open('transformers-cache');
                return cache.match(request);
            },
            async put(_request, _response) { },
        };
        mod.env.allowLocalModels = false;
        mod.env.allowRemoteModels = true;
        transformersModule = mod;
        return mod;
    })();
}
// ===== Model Singletons =====
let extractorPromise = null;
let nliPipelinePromise = null;
function getExtractor() {
    return extractorPromise ??= (async () => {
        const { pipeline } = await getTransformers();
        return pipeline("feature-extraction", EMBEDDING_MODEL, {
            dtype: "q8",
        });
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
        embeddingCache.delete(embeddingCache.keys().next().value);
    }
    embeddingCache.set(text, result);
    return result;
}
function cosine(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}
function remap(value, low, high, power) {
    const raw = Math.max(0, Math.min(1, (value - low) / (high - low)));
    return Math.pow(raw, power);
}
const { normalizeRaw, normalizeWord, numberEq } = LanguageUtility;
const ss = (text) => new SemanticString(text);
// ===== Stage 1: Length Check =====
function checkLength(text, answerSS, idealSize) {
    let lengthRatio = 1;
    if (idealSize && idealSize > 0) {
        lengthRatio = text.length / idealSize;
    }
    else if (answerSS.length > 0) {
        // Use token counts (stopword-filtered) for length comparison so that
        // filler words don't affect the perceived answer size.
        const avgTokens = answerSS.reduce((s, a) => s + a.tokenCount, 0) / answerSS.length;
        const userTokens = new SemanticString(text).tokenCount;
        lengthRatio = avgTokens > 0 ? userTokens / avgTokens : 1;
    }
    return { lengthRatio, lengthMismatch: lengthRatio < PARAMS.length.mismatchThreshold };
}
// ===== Stage 2: Semantic-Logic Score =====
/** Direct cosine similarity: user text vs each reference as a whole (0..1) */
async function directSimilarity(userSS, answerSS) {
    const userText = userSS.raw;
    // Use content-only (stopword-filtered) representation for embeddings
    // so filler / low-meaning words don't skew similarity.
    const userEmb = await embed(userSS.content);
    // Tokenize + normalize user words (stopwords removed) and their embeddings
    const userWords = [...userSS.tokens];
    const userWordEmbs = userWords.length ? await Promise.all(userWords.map(embed)) : [];
    let max = 0;
    for (let ai = 0; ai < answerSS.length; ai++) {
        const ansSS = answerSS[ai];
        const ansEmb = await embed(ansSS.content);
        const cosSim = cosine(userEmb, ansEmb);
        const cosScore = remap(cosSim, PARAMS.similarity.low, PARAMS.similarity.high, PARAMS.similarity.power);
        // Per-word recall: tokenize reference words (normalized)
        const refWords = [...ansSS.tokens];
        let wordRecall = 1.0;
        if (refWords.length > 0) {
            if (userWordEmbs.length === 0) {
                wordRecall = 0;
            }
            else {
                const refWordEmbs = await Promise.all(refWords.map(embed));
                let totalWordScore = 0;
                for (let ri = 0; ri < refWords.length; ri++) {
                    const refWord = refWords[ri];
                    if (userWords.includes(refWord)) {
                        totalWordScore += 1.0;
                    }
                    else {
                        let bestWordSim = 0;
                        for (const uEmb of userWordEmbs) {
                            const s = cosine(uEmb, refWordEmbs[ri]);
                            if (s > bestWordSim)
                                bestWordSim = s;
                        }
                        // Strong semantic matches only (threshold 0.85), map to 0..1
                        const semScore = bestWordSim > 0.85 ? Math.min(1, (bestWordSim - 0.85) / 0.15) : 0;
                        totalWordScore += semScore;
                    }
                }
                wordRecall = totalWordScore / refWords.length;
            }
        }
        else {
            wordRecall = 1.0;
        }
        // Multiplicative penalty — reduces cosine-based similarity when many words differ
        const penaltyFactor = 0.4 + 0.6 * wordRecall; // ranges 0.4..1.0
        let score = cosScore * penaltyFactor;
        // Hard requirement: if cosine is high but wordRecall is below minimum,
        // apply an additional harsher penalty so topic-only matches don't yield max scores.
        const minRecall = PARAMS.similarity.minWordRecall ?? 0.25;
        const highReq = PARAMS.similarity.highRequire ?? 0.80;
        const hardScale = PARAMS.similarity.hardPenaltyScale ?? 0.5;
        if (cosScore >= highReq && wordRecall < minRecall) {
            const ratio = wordRecall / Math.max(1e-6, minRecall);
            const hardPenalty = Math.max(0.1, ratio * hardScale);
            score *= hardPenalty;
        }
        if (score > max)
            max = score;
    }
    return Math.min(1, max);
}
/** Sentence-level coverage: how well user text covers reference sentences (0..1) */
async function sentenceCoverage(userSS, answerSS) {
    const userText = userSS.raw;
    if (answerSS.length === 0)
        return 0;
    const userSents = [...userSS.sentences];
    if (userSents.length === 0)
        userSents.push(userText);
    // Embed content-only sentence text to ignore filler words
    const userEmbs = await Promise.all(userSents.map(s => embed(ss(s).content)));
    const fullEmb = await embed(userSS.content);
    let bestAnswer = 0;
    for (let ai = 0; ai < answerSS.length; ai++) {
        const refSS = answerSS[ai];
        const refSents = [...refSS.sentences];
        if (refSents.length === 0)
            refSents.push(refSS.raw);
        let total = 0;
        for (const refSent of refSents) {
            const refEmb = await embed(ss(refSent).content);
            let best = cosine(fullEmb, refEmb);
            for (const uEmb of userEmbs) {
                const sim = cosine(uEmb, refEmb);
                if (sim > best)
                    best = sim;
            }
            total += remap(best, PARAMS.coverage.low, PARAMS.coverage.high, PARAMS.coverage.power);
        }
        const score = total / refSents.length;
        if (score > bestAnswer)
            bestAnswer = score;
    }
    return Math.min(1, bestAnswer);
}
/** Keyword matching: exact match or semantic fallback (0..1) */
async function keywordScore(userSS, keywordSS) {
    const userText = userSS.raw;
    if (keywordSS.length === 0)
        return 0;
    const parts = userText.split(/[.!?]/);
    const userTokens = userSS.tokenSet;
    const userNums = userSS.numbers;
    const partEmbs = await Promise.all(parts.map(p => embed(ss(p).content)));
    const kwEmbs = await Promise.all(keywordSS.map(k => embed(k.content)));
    let total = 0;
    for (let i = 0; i < keywordSS.length; i++) {
        const kwSS = keywordSS[i];
        const kwLower = kwSS.raw.toLowerCase();
        // Do not reward lexically matched phrases when they are explicitly negated by user.
        if (userSS.negates(kwLower)) {
            continue;
        }
        const kwNums = kwSS.numbers;
        if (kwNums.length > 0) {
            let matchedNums = 0;
            for (const kn of kwNums) {
                if (userNums.some(un => numberEq(un, kn)))
                    matchedNums++;
            }
            const numOverlap = matchedNums / kwNums.length;
            if (numOverlap >= 1) {
                total += 1;
                continue;
            }
            if (numOverlap > 0) {
                total += 0.6 + (0.4 * numOverlap);
                continue;
            }
        }
        const kwTokens = [...kwSS.tokens];
        if (kwTokens.length > 0) {
            let overlapCount = 0;
            for (const t of kwTokens)
                if (userTokens.has(t))
                    overlapCount++;
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
            // For incomplete multi-word phrases, keep credit conservative and skip
            // semantic fallback to avoid false positives on related but different terms.
            if (kwTokens.length > 1 && overlap > 0) {
                total += 0.15 + 0.35 * overlap;
                continue;
            }
        }
        const kwNorm = normalizeWord(kwLower);
        if (kwNorm && userTokens.has(kwNorm)) {
            total += 1;
            continue;
        }
        const sim = Math.max(...partEmbs.map(e => cosine(e, kwEmbs[i])));
        const t = Math.max(0, Math.min(1, (sim - 0.75) / (0.90 - 0.75)));
        let semFallback = Math.pow(t, 3);
        if (kwTokens.length > 1) {
            semFallback = Math.min(semFallback, kwTokens.length >= 3 ? 0.25 : 0.18);
        }
        total += semFallback;
    }
    return total / keywordSS.length;
}
/** Combined semantic-logic score from similarity + coverage + keywords */
async function computeSemanticLogicScore(input) {
    const { userSS, answerSS, keywordSS } = input;
    const userText = userSS.raw;
    // Short-answer overrides: detect numeric answers, acronyms, or exact-token subset
    function computeShortAnswerOverride(uSS, answersListSS, kwsSS, questionTitleSS) {
        const userNums = uSS.numbers;
        const userTokens = [...uSS.tokens];
        const userTokenSet = uSS.tokenSet;
        const keywordGroups = kwsSS
            .map(k => ({ tokens: [...k.tokens], phrase: k.raw.toLowerCase() }))
            .filter(g => g.tokens.length > 0);
        if (keywordGroups.length === 0 && questionTitleSS) {
            const titleTokens = [...questionTitleSS.tokens];
            if (titleTokens.length > 0) {
                keywordGroups.push({ tokens: titleTokens, phrase: questionTitleSS.raw.toLowerCase() });
            }
        }
        const keywordFlat = new Set(keywordGroups.flatMap(g => g.tokens));
        const calcOverlap = (group) => {
            let hits = 0;
            for (const t of group.tokens)
                if (userTokenSet.has(t))
                    hits++;
            return group.tokens.length > 0 ? hits / group.tokens.length : 0;
        };
        // Numeric answers: strong signal — allow augmentation (append matching ref fragment)
        const allUserNumsConsistent = userNums.length > 0
            ? userNums.every(un => answersListSS.some(a => a.constraintSatisfiedBy(un)))
            : false;
        if (userNums.length && allUserNumsConsistent) {
            for (let ai = 0; ai < answersListSS.length; ai++) {
                const aSS = answersListSS[ai];
                const refNums = [...aSS.numbers];
                const text = aSS.raw.toLowerCase();
                const rangeMatch1 = text.match(/от\s+(\d+)\s+до\s+(\d+)/);
                const rangeMatch2 = text.match(/(\d+)\s*[-–]\s*(\d+)/);
                if (rangeMatch1) {
                    const min = Number(rangeMatch1[1]);
                    const max = Number(rangeMatch1[2]);
                    if (userNums.some(un => Number(un) >= min && Number(un) <= max))
                        return { similarity: 0.85, coverage: 0.8, kw: 1.0, reason: 'numeric-range', augment: aSS.raw };
                    continue;
                }
                if (rangeMatch2) {
                    const min = Number(rangeMatch2[1]);
                    const max = Number(rangeMatch2[2]);
                    if (userNums.some(un => Number(un) >= min && Number(un) <= max))
                        return { similarity: 0.85, coverage: 0.8, kw: 1.0, reason: 'numeric-range', augment: aSS.raw };
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
                            return { similarity: 0.85, coverage: 0.8, kw: 1.0, reason: 'numeric-gte', augment: aSS.raw };
                    }
                    else if (hasLte) {
                        if (userNums.some(un => Number(un) <= refVal))
                            return { similarity: 0.85, coverage: 0.8, kw: 1.0, reason: 'numeric-lte', augment: aSS.raw };
                    }
                    else {
                        if (userNums.some(un => Number(un) === refVal))
                            return { similarity: 0.85, coverage: 0.8, kw: 1.0, reason: 'numeric-eq', augment: aSS.raw };
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
                const bestKeywordRaw = bestGroup.phrase;
                if (bestKeywordRaw && uSS.negates(bestKeywordRaw)) {
                    return null;
                }
                const shortEnough = userTokens.length <= Math.max(7, bestGroup.tokens.length + 3);
                if (bestOverlap >= 1 && shortEnough) {
                    return { similarity: 0.92, coverage: 0.9, kw: 1.0, reason: 'keyword-exact' };
                }
                if (bestOverlap >= 0.66 && shortEnough) {
                    return { similarity: 0.78, coverage: 0.75, kw: 0.92, reason: 'keyword-partial' };
                }
                // Morphology-tolerant partial for long keyword phrases (e.g. generic form of a 3+ word concept)
                if (bestGroup.tokens.length >= 3 && bestOverlap >= 0.5 && shortEnough) {
                    return { similarity: 0.72, coverage: 0.68, kw: 0.82, reason: 'keyword-partial-loose' };
                }
            }
        }
        for (let ai = 0; ai < answersListSS.length; ai++) {
            const aSS = answersListSS[ai];
            // Acronym match — allow augmentation with expanded tokens
            const acronym = aSS.acronym;
            const userNorm = normalizeRaw(uSS.raw).toLowerCase();
            if (userNorm && (userNorm === acronym || userTokens.includes(acronym))) {
                return { similarity: 0.8, coverage: 0.75, kw: 1.0, reason: 'acronym', augment: `${[...aSS.tokens].join(' ')}` };
            }
            // Exact token subset: modest boost (no augmentation)
            if (userTokens.length > 0 && userTokens.every(t => aSS.hasToken(t))) {
                const cov = Math.min(1, 0.5 + (userTokens.length / Math.max(1, aSS.tokenCount)));
                const kwv = keywordGroups.length && userTokens.some(u => keywordFlat.has(u)) ? 1.0 : 0.8;
                return { similarity: 0.75, coverage: cov, kw: kwv, reason: 'subset' };
            }
        }
        return null;
    }
    // Short-answer override: may provide conservative suggestions and an optional safe augmentation
    const shortOverride = computeShortAnswerOverride(userSS, answerSS, keywordSS, input.questionTitleSS);
    // Decide whether to augment the user text (only when override suggests a safe augment)
    let effectiveText = userText;
    let usedAugment = false;
    let effectiveSS = userSS;
    if (shortOverride && shortOverride.augment) {
        const reason = shortOverride.reason ?? '';
        const simOverride = shortOverride.similarity ?? 0;
        // Allow augment when similarity suggestion is strong, or when keyword exactly matches user text
        let augmentOk = false;
        if (reason === 'keyword-present' && typeof shortOverride.augment === 'string') {
            const augNorm = normalizeWord(shortOverride.augment.toLowerCase());
            if (augNorm && normalizeWord(userText.toLowerCase()) === augNorm)
                augmentOk = true;
        }
        if (!augmentOk && simOverride >= 0.75)
            augmentOk = true;
        if (augmentOk) {
            const augStr = String(shortOverride.augment ?? '').trim();
            const augNorm = normalizeWord(augStr.toLowerCase());
            const userNorm = normalizeWord(userText.toLowerCase());
            if (augStr && augNorm && !userNorm.includes(augNorm)) {
                effectiveText = (userText + ' ' + augStr).trim();
                effectiveSS = ss(effectiveText);
                usedAugment = true;
            }
        }
    }
    let similarity = 0, coverage = 0, kw = 0;
    const negationContradiction = keywordSS.some(k => userSS.negates(k.raw.toLowerCase()));
    let overrideReason = '';
    if (usedAugment) {
        const [sRaw, cRaw, kRaw] = await Promise.all([
            directSimilarity(effectiveSS, answerSS),
            sentenceCoverage(effectiveSS, answerSS),
            keywordScore(effectiveSS, keywordSS),
        ]);
        similarity = sRaw;
        coverage = cRaw;
        kw = kRaw;
    }
    else {
        const [sRaw, cRaw, kRaw] = await Promise.all([
            directSimilarity(userSS, answerSS),
            sentenceCoverage(userSS, answerSS),
            keywordScore(userSS, keywordSS),
        ]);
        similarity = sRaw;
        coverage = cRaw;
        kw = kRaw;
        // If there's a short override, blend its conservative suggestions (no double-counting with augmentation)
        if (shortOverride) {
            const reason = shortOverride.reason ?? '';
            overrideReason = reason;
            let alpha = 0.5;
            if (reason.startsWith('numeric'))
                alpha = 0.75;
            else if (reason === 'acronym')
                alpha = 0.6;
            else if (reason === 'subset')
                alpha = 0.6;
            else if (reason === 'keyword-partial')
                alpha = 0.78;
            else if (reason === 'keyword-partial-loose')
                alpha = 0.68;
            else if (reason === 'keyword-exact')
                alpha = 0.85;
            else if (reason === 'keyword-present')
                alpha = 0.5;
            const oSim = shortOverride.similarity ?? similarity;
            const oCov = shortOverride.coverage ?? coverage;
            const oKw = shortOverride.kw ?? kw;
            similarity = Math.max(0, Math.min(1, similarity * (1 - alpha) + oSim * alpha));
            coverage = Math.max(0, Math.min(1, coverage * (1 - alpha) + oCov * alpha));
            kw = Math.max(0, Math.min(1, kw * (1 - alpha) + oKw * alpha));
        }
    }
    if (negationContradiction) {
        similarity = Math.min(similarity, 0.5);
        coverage = Math.min(coverage, 0.45);
        kw = Math.min(kw, 0.2);
    }
    const w = PARAMS.weights;
    const base = keywordSS.length > 0
        ? similarity * w.similarity + coverage * w.coverage + kw * w.keyword
        : similarity * w.similarityNoKw + coverage * w.coverageNoKw;
    let penalty = Math.min(1, Math.min(similarity, coverage) + 0.2);
    if (overrideReason === 'keyword-partial')
        penalty = Math.max(penalty, 0.85);
    if (overrideReason === 'keyword-partial-loose')
        penalty = Math.max(penalty, 0.82);
    if (overrideReason === 'keyword-exact')
        penalty = Math.max(penalty, 0.92);
    const numeric = userSS.numericConsistency(answerSS);
    const contradictionFactor = negationContradiction ? 0.35 : 1.0;
    const score = base * penalty * numeric.factor * contradictionFactor;
    return { score, similarity, coverage, kw, augmented: usedAugment, effectiveText, numericMismatch: numeric.mismatch, negationContradiction };
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
async function computeConfidenceModifierUnifiedSafe(userSS, answerSS, keywordSS) {
    const userText = userSS.raw;
    if (!answerSS.length || !userText.trim())
        return 1.0;
    // --- 1. Семантика, покрытие, ключевые слова ---
    const [sim, cov, kw] = await Promise.all([
        answerSS.length > 0 ? directSimilarity(userSS, answerSS) : Promise.resolve(1.0),
        answerSS.length > 0 ? sentenceCoverage(userSS, answerSS) : Promise.resolve(1.0),
        keywordSS.length > 0 ? keywordScore(userSS, keywordSS) : Promise.resolve(1.0)
    ]);
    const w = { sim: 0.35, cov: 0.4, kw: 0.25 };
    const base = !isNaN(sim) && !isNaN(cov) && !isNaN(kw)
        ? (keywordSS.length > 0 ? sim * w.sim + cov * w.cov + kw * w.kw : sim * w.sim + cov * w.cov)
        : 0.8;
    // --- 2. Длина ответа относительно эталона ---
    // Compute length ratio using token counts (stopword-filtered) so that
    // filler words don't affect the perceived answer size.
    const avgLen = answerSS.length ? answerSS.reduce((s, a) => s + a.tokenCount, 0) / answerSS.length : 1;
    const lengthRatio = avgLen > 0 ? userSS.tokenCount / avgLen : 1;
    const lengthMod = Math.min(1.2, Math.max(0.8, lengthRatio));
    // --- 3. Вариативность embeddings ---
    const userSents = [...userSS.sentences];
    const userEmbs = userSents.length
        ? await Promise.all(userSents.map(s => embed(ss(s).content)))
        : [await embed(userSS.content)];
    let totalVar = 0;
    for (let ai = 0; ai < answerSS.length; ai++) {
        const refSents = [...answerSS[ai].sentences];
        const refEmbs = refSents.length ? await Promise.all(refSents.map(rs => embed(ss(rs).content))) : [await embed(answerSS[ai].content)];
        const sims = [];
        for (const u of userEmbs)
            for (const r of refEmbs) {
                const c = cosine(u, r);
                if (!isNaN(c))
                    sims.push(c);
            }
        if (sims.length) {
            const mean = sims.reduce((s, n) => s + n, 0) / sims.length;
            const varSim = sims.reduce((s, n) => s + Math.pow(n - mean, 2), 0) / sims.length;
            totalVar += varSim;
        }
    }
    const avgVar = answerSS.length ? totalVar / answerSS.length : 0;
    const varianceMod = Math.min(1.2, Math.max(0.7, 1 - avgVar));
    // --- 4. Комбинированный модификатор ---
    let modifier = base * lengthMod * varianceMod;
    // --- 5. Ремаппинг на новые пределы 0.6 → 1.5 ---
    const minMod = 0.6;
    const maxMod = 1.5;
    modifier = isNaN(modifier) ? 1.0 : minMod + (maxMod - minMod) * Math.min(1, Math.max(0, modifier));
    return modifier;
}
const EMPTY_BREAKDOWN = {
    similarity: 0, coverage: 0, keyword: 0,
    hasKeywords: false, confidenceModifier: 1, criticalError: false,
    augmented: false,
    numericMismatch: false,
    similarityBonusPercent: 0, coverageBonusPercent: 0, keywordBonusPercent: 0, bonusMultiplier: 1,
    similarityWeight: 0, coverageWeight: 0, keywordWeight: 0
};
export default class SimilarityScorer {
    static async preload() { }
    // Enabling toggle removed: confidence modifier is always computed.
    static async score(userText, answers, keywords, questionTitle, idealSize) {
        const trimmed = userText.trim();
        if (trimmed.length === 0) {
            return { score: 0, lengthMismatch: true, lengthRatio: 0, breakdown: { ...EMPTY_BREAKDOWN } };
        }
        const normalizedQuestionTitle = questionTitle?.trim() ?? '';
        const semanticInput = {
            userSS: ss(trimmed),
            answerSS: answers.map(a => ss(a)),
            keywordSS: keywords.map(k => ss(k)),
            questionTitleSS: normalizedQuestionTitle ? ss(normalizedQuestionTitle) : null,
        };
        // Stage 1: Length
        const { lengthRatio, lengthMismatch } = checkLength(trimmed, semanticInput.answerSS, idealSize);
        if (semanticInput.answerSS.length === 0) {
            const kw = await keywordScore(semanticInput.userSS, semanticInput.keywordSS);
            return {
                score: Math.round(kw * 100), lengthMismatch, lengthRatio,
                breakdown: { ...EMPTY_BREAKDOWN, keyword: Math.round(kw * 100), hasKeywords: semanticInput.keywordSS.length > 0, keywordWeight: 100 },
            };
        }
        // Stage 2: Semantic-Logic
        const sem = await computeSemanticLogicScore(semanticInput);
        // Stage 3: confidence modifier (always computed). This is a multiplicative modifier
        // applied to the final score (1.0 = no change). It is NOT a percent.
        let criticalError = !!sem.negationContradiction;
        const cmText = sem.effectiveText && sem.augmented ? sem.effectiveText : trimmed;
        const cmSS = cmText === semanticInput.userSS.raw ? semanticInput.userSS : ss(cmText);
        let confidenceModifier = await computeConfidenceModifierUnifiedSafe(cmSS, semanticInput.answerSS, semanticInput.keywordSS);
        if (sem.numericMismatch) {
            // Prevent contradictory numeric answers from being boosted by confidence modifier.
            confidenceModifier = Math.min(confidenceModifier, 0.85);
        }
        if (criticalError) {
            confidenceModifier = Math.min(confidenceModifier, 0.8);
        }
        if (semanticInput.keywordSS.length > 0 && sem.kw < 0.8) {
            // If keyword evidence is incomplete, disable positive confidence boost.
            confidenceModifier = Math.min(confidenceModifier, 1.0);
        }
        const finalScore = Math.min(1, Math.max(0.01, sem.score));
        // Bonus per component that reaches 100% (stackable). Each gives +20% by design.
        const hasKw = semanticInput.keywordSS.length > 0;
        const perBonus = 0.2;
        const hasNumericMismatch = !!sem.numericMismatch;
        const similarityBonus = !hasNumericMismatch && !criticalError && sem.similarity >= 1 ? perBonus : 0;
        const coverageBonus = !hasNumericMismatch && !criticalError && sem.coverage >= 1 ? perBonus : 0;
        const keywordBonus = !hasNumericMismatch && !criticalError && hasKw && sem.kw >= 1 ? perBonus : 0;
        const bonusMultiplier = 1.0 + similarityBonus + coverageBonus + keywordBonus;
        const scoredFinal = Math.min(1, finalScore * bonusMultiplier);
        // Apply confidence modifier (multiplier) and clamp
        const finalWithModifier = Math.min(1, Math.max(0, scoredFinal * confidenceModifier));
        const w = PARAMS.weights;
        const breakdown = {
            similarity: Math.round(sem.similarity * 100),
            coverage: Math.round(sem.coverage * 100),
            keyword: Math.round(sem.kw * 100),
            hasKeywords: hasKw,
            confidenceModifier,
            criticalError,
            augmented: !!sem.augmented,
            numericMismatch: !!sem.numericMismatch,
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
//# sourceMappingURL=SimilarityScorer.js.map