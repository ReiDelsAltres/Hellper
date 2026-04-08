import LanguageUtility from "./LanguageUtility.js";
import { RE, STOPWORDS, NEGATION_TOKENS, GTE_PHRASES, LTE_PHRASES, TEXTRANK_DEFAULTS } from "./LanguageUtility.js";
export default class SemanticString {
    /** Original raw text */
    raw;
    // ── Lazy-cached derived data ──
    _lower = null;
    _normalized = null;
    _tokens = null;
    _tokenSet = null;
    _phraseTokens = null;
    _sentences = null;
    _numbers = null;
    _numericRanges = null;
    _summary = null;
    constructor(text) {
        this.raw = text;
    }
    // ── Basic Properties ──
    get length() { return this.raw.length; }
    get isEmpty() { return this.raw.trim().length === 0; }
    get trimmed() { return this.raw.trim(); }
    get lower() {
        return this._lower ??= this.raw.toLowerCase();
    }
    get normalized() {
        return this._normalized ??= LanguageUtility.normalizeWord(this.lower);
    }
    // ── Tokenization ──
    get tokens() {
        return this._tokens ??= this.computeTokens();
    }
    get tokenSet() {
        return this._tokenSet ??= new Set(this.tokens);
    }
    get tokenCount() {
        return this.tokens.length;
    }
    /**
     * Content-only text: normalized, stopword-filtered tokens joined as a string.
     * Use this for embedding calculations so that filler / low-meaning words
     * don't overly influence semantic similarity measurements.
     */
    get content() {
        const t = this.tokens;
        if (!t || t.length === 0)
            return this.trimmed;
        return t.join(' ');
    }
    get phraseTokens() {
        return this._phraseTokens ??= this.computePhraseTokens();
    }
    computeTokens() {
        const raw = (this.raw.match(RE.contentWord) ?? []);
        const out = [];
        for (const w of raw) {
            const n = LanguageUtility.normalizeWord(w);
            if (!n)
                continue;
            if (STOPWORDS.has(n))
                continue;
            out.push(n);
        }
        return [...new Set(out)];
    }
    computePhraseTokens() {
        const raw = (this.raw.match(RE.phraseWord) ?? []);
        const out = [];
        for (const w of raw) {
            const n = LanguageUtility.normalizeWord(w);
            if (!n)
                continue;
            out.push(n);
        }
        return out;
    }
    // ── Sentence Splitting ──
    get sentences() {
        return this._sentences ??= this.computeSentences();
    }
    get sentenceCount() {
        return this.sentences.length;
    }
    /** Sentence-level parts split at . ! ? (not filtered by length) */
    get clauses() {
        return this.raw.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
    }
    computeSentences() {
        return this.raw
            .split(RE.sentenceSplit)
            .map(s => s.trim())
            .filter(s => s.length > TEXTRANK_DEFAULTS.minSentenceLength);
    }
    // ── Numeric ──
    get numbers() {
        return this._numbers ??= this.computeNumbers();
    }
    get hasNumbers() {
        return this.numbers.length > 0;
    }
    get numericRanges() {
        return this._numericRanges ??= this.computeNumericRanges();
    }
    computeNumbers() {
        const raw = this.raw.match(RE.number) ?? [];
        const nums = [];
        for (const r of raw) {
            const n = Number(r.replace(',', '.'));
            if (!Number.isNaN(n))
                nums.push(n);
        }
        return nums;
    }
    computeNumericRanges() {
        const ranges = [];
        const lower = this.lower;
        for (const m of lower.matchAll(new RegExp(RE.rangeBetween.source, 'g'))) {
            const a = Number((m[1] ?? '0').replace(',', '.'));
            const b = Number((m[2] ?? '0').replace(',', '.'));
            if (!Number.isNaN(a) && !Number.isNaN(b)) {
                ranges.push({ min: Math.min(a, b), max: Math.max(a, b) });
            }
        }
        for (const m of lower.matchAll(new RegExp(RE.rangeDash.source, 'g'))) {
            const a = Number((m[1] ?? '0').replace(',', '.'));
            const b = Number((m[2] ?? '0').replace(',', '.'));
            if (!Number.isNaN(a) && !Number.isNaN(b)) {
                ranges.push({ min: Math.min(a, b), max: Math.max(a, b) });
            }
        }
        return ranges;
    }
    // ── Token Queries ──
    hasToken(token) {
        return this.tokenSet.has(token);
    }
    hasAllTokens(tokens) {
        return tokens.length > 0 && tokens.every(t => this.tokenSet.has(t));
    }
    hasAnyToken(tokens) {
        return tokens.some(t => this.tokenSet.has(t));
    }
    tokenOverlap(other) {
        if (this.tokenCount === 0 || other.tokenCount === 0)
            return 0;
        let count = 0;
        for (const t of this.tokens) {
            if (other.tokenSet.has(t))
                count++;
        }
        return count;
    }
    tokenOverlapRatio(other) {
        const total = Math.max(this.tokenCount, other.tokenCount);
        return total > 0 ? this.tokenOverlap(other) / total : 0;
    }
    /** Fraction of `reference` tokens found in this string */
    recallAgainst(reference) {
        if (reference.tokenCount === 0)
            return 1;
        let hits = 0;
        for (const t of reference.tokens) {
            if (this.tokenSet.has(t))
                hits++;
        }
        return hits / reference.tokenCount;
    }
    /** Fraction of this string's tokens found in `reference` */
    precisionAgainst(reference) {
        if (this.tokenCount === 0)
            return 0;
        let hits = 0;
        for (const t of this.tokens) {
            if (reference.tokenSet.has(t))
                hits++;
        }
        return hits / this.tokenCount;
    }
    isSubsetOf(other) {
        if (this.tokenCount === 0)
            return false;
        for (const t of this.tokens) {
            if (!other.tokenSet.has(t))
                return false;
        }
        return true;
    }
    // ── Negation Detection ──
    negates(phrase) {
        const phraseSS = new SemanticString(phrase);
        if (!phraseSS.phraseTokens.length)
            return false;
        const userPhraseTokens = this.phraseTokens;
        if (!userPhraseTokens.length)
            return false;
        const pTokens = phraseSS.phraseTokens;
        for (let i = 0; i < userPhraseTokens.length; i++) {
            if (userPhraseTokens[i] !== pTokens[0])
                continue;
            const prev = i > 0 ? userPhraseTokens[i - 1] : '';
            const prevPrev = i > 1 ? userPhraseTokens[i - 2] : '';
            if (!NEGATION_TOKENS.has(prev))
                continue;
            // Guard against double-negation forms like "нельзя не ...".
            if (NEGATION_TOKENS.has(prevPrev))
                continue;
            if (pTokens.length === 1)
                return true;
            let pos = i;
            let matched = true;
            for (let p = 1; p < pTokens.length; p++) {
                let found = false;
                for (let j = pos + 1; j <= Math.min(userPhraseTokens.length - 1, pos + 3); j++) {
                    if (userPhraseTokens[j] === pTokens[p]) {
                        pos = j;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    matched = false;
                    break;
                }
            }
            if (matched)
                return true;
        }
        return false;
    }
    negatesAny(phrases) {
        return phrases.some(p => this.negates(p));
    }
    // ── Numeric Constraints ──
    /** Check if `userNum` satisfies the numeric constraints expressed in this text */
    constraintSatisfiedBy(userNum) {
        const refNums = this.numbers;
        if (!refNums.length)
            return true;
        if (this.numericRanges.some(r => userNum >= r.min && userNum <= r.max)) {
            return true;
        }
        const text = this.lower;
        const hasGte = GTE_PHRASES.some(p => text.includes(p));
        const hasLte = LTE_PHRASES.some(p => text.includes(p));
        const refVal = refNums[0];
        if (hasGte)
            return userNum >= refVal;
        if (hasLte)
            return userNum <= refVal;
        return refNums.some(rn => LanguageUtility.numberEq(userNum, rn));
    }
    satisfiesNumericConstraint(referenceText) {
        const ref = new SemanticString(referenceText);
        return this.numbers.every(n => ref.constraintSatisfiedBy(n));
    }
    numericConsistency(answers) {
        const userNums = this.numbers;
        if (!userNums.length)
            return { factor: 1.0, mismatch: false };
        const normalizedAnswers = answers.map(a => typeof a === 'string' ? new SemanticString(a) : a);
        const numericAnswers = normalizedAnswers.filter(a => a.hasNumbers);
        if (!numericAnswers.length)
            return { factor: 1.0, mismatch: false };
        let validCount = 0;
        for (const un of userNums) {
            if (numericAnswers.some(a => a.constraintSatisfiedBy(un))) {
                validCount++;
            }
        }
        const validRatio = validCount / userNums.length;
        if (validRatio >= 1)
            return { factor: 1.0, mismatch: false };
        const factor = validRatio <= 0 ? 0.55 : (0.55 + 0.45 * validRatio);
        return { factor, mismatch: true };
    }
    matchesNumber(n) {
        return this.numbers.some(own => LanguageUtility.numberEq(own, n));
    }
    // ── Acronym ──
    get acronym() {
        return this.tokens.map(t => t[0]).join('').toLowerCase();
    }
    matchesAcronymOf(other) {
        const acr = other.acronym;
        if (!acr)
            return false;
        const norm = LanguageUtility.normalizeRaw(this.raw).toLowerCase();
        return norm === acr || this.hasToken(acr);
    }
    // ── TextRank Summarization (Mihalcea & Tarau, 2004) ──
    get summary() {
        return this._summary ??= this.textRank();
    }
    summarize(topN) {
        return this.textRank(topN);
    }
    get gist() {
        return this.summary.join(' ');
    }
    textRank(topN = 3, options) {
        const cfg = { ...TEXTRANK_DEFAULTS, ...options };
        const sentences = [...this.sentences];
        if (sentences.length <= topN)
            return sentences;
        const tokenSets = sentences.map(s => new Set(new SemanticString(s).tokens));
        const n = sentences.length;
        const sim = Array.from({ length: n }, () => new Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const overlap = this.wordOverlap(tokenSets[i], tokenSets[j]);
                sim[i][j] = overlap;
                sim[j][i] = overlap;
            }
        }
        let scores = new Array(n).fill(1 / n);
        for (let iter = 0; iter < cfg.maxIterations; iter++) {
            const next = new Array(n).fill(0);
            let maxDelta = 0;
            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < n; j++) {
                    if (i === j)
                        continue;
                    const outSum = sim[j].reduce((a, v, k) => k !== j ? a + v : a, 0);
                    if (outSum > 0) {
                        sum += (sim[j][i] / outSum) * scores[j];
                    }
                }
                next[i] = (1 - cfg.damping) / n + cfg.damping * sum;
                maxDelta = Math.max(maxDelta, Math.abs(next[i] - scores[i]));
            }
            scores = next;
            if (maxDelta < cfg.convergence)
                break;
        }
        const ranked = scores
            .map((score, idx) => ({ score, idx }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topN)
            .map(r => r.idx)
            .sort((a, b) => a - b);
        return ranked.map(idx => sentences[idx]);
    }
    wordOverlap(a, b) {
        if (a.size === 0 || b.size === 0)
            return 0;
        let overlap = 0;
        for (const w of a) {
            if (b.has(w))
                overlap++;
        }
        if (overlap === 0)
            return 0;
        return overlap / (Math.log(a.size) + Math.log(b.size) || 1);
    }
    // ── Length Ratio ──
    lengthRatio(reference) {
        return reference.length > 0 ? this.length / reference.length : 1;
    }
    // ── Composition ──
    append(suffix) {
        return new SemanticString((this.raw + ' ' + suffix).trim());
    }
    static from(text) {
        return new SemanticString(text);
    }
    static many(texts) {
        return texts.map(t => new SemanticString(t));
    }
    // ── String Protocol ──
    toString() {
        return this.raw;
    }
    valueOf() {
        return this.raw;
    }
}
//# sourceMappingURL=SemanticString.js.map