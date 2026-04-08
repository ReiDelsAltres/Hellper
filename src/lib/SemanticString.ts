import LanguageUtility from "./LanguageUtility.js";
import { RE, STOPWORDS, NEGATION_TOKENS, GTE_PHRASES, LTE_PHRASES, TEXTRANK_DEFAULTS } from "./LanguageUtility.js";

export default class SemanticString {

    /** Original raw text */
    public readonly raw: string;

    // ── Lazy-cached derived data ──

    private _lower: string | null = null;
    private _normalized: string | null = null;
    private _tokens: string[] | null = null;
    private _tokenSet: Set<string> | null = null;
    private _phraseTokens: string[] | null = null;
    private _sentences: string[] | null = null;
    private _numbers: number[] | null = null;
    private _numericRanges: Array<{ min: number; max: number }> | null = null;
    private _summary: string[] | null = null;

    public constructor(text: string) {
        this.raw = text;
    }

    // ── Basic Properties ──

    public get length(): number { return this.raw.length; }
    public get isEmpty(): boolean { return this.raw.trim().length === 0; }
    public get trimmed(): string { return this.raw.trim(); }

    public get lower(): string {
        return this._lower ??= this.raw.toLowerCase();
    }

    public get normalized(): string {
        return this._normalized ??= LanguageUtility.normalizeWord(this.lower);
    }

    // ── Tokenization ──

    public get tokens(): readonly string[] {
        return this._tokens ??= this.computeTokens();
    }

    public get tokenSet(): ReadonlySet<string> {
        return this._tokenSet ??= new Set(this.tokens);
    }

    public get tokenCount(): number {
        return this.tokens.length;
    }

    /**
     * Content-only text: normalized, stopword-filtered tokens joined as a string.
     * Use this for embedding calculations so that filler / low-meaning words
     * don't overly influence semantic similarity measurements.
     */
    public get content(): string {
        const t = this.tokens;
        if (!t || t.length === 0) return this.trimmed;
        return t.join(' ');
    }

    public get phraseTokens(): readonly string[] {
        return this._phraseTokens ??= this.computePhraseTokens();
    }

    private computeTokens(): string[] {
        const raw = (this.raw.match(RE.contentWord) ?? []);
        const out: string[] = [];
        for (const w of raw) {
            const n = LanguageUtility.normalizeWord(w);
            if (!n) continue;
            if (STOPWORDS.has(n)) continue;
            out.push(n);
        }
        return [...new Set(out)];
    }

    private computePhraseTokens(): string[] {
        const raw = (this.raw.match(RE.phraseWord) ?? []);
        const out: string[] = [];
        for (const w of raw) {
            const n = LanguageUtility.normalizeWord(w);
            if (!n) continue;
            out.push(n);
        }
        return out;
    }

    // ── Sentence Splitting ──

    public get sentences(): readonly string[] {
        return this._sentences ??= this.computeSentences();
    }

    public get sentenceCount(): number {
        return this.sentences.length;
    }

    /** Sentence-level parts split at . ! ? (not filtered by length) */
    public get clauses(): string[] {
        return this.raw.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
    }

    private computeSentences(): string[] {
        return this.raw
            .split(RE.sentenceSplit)
            .map(s => s.trim())
            .filter(s => s.length > TEXTRANK_DEFAULTS.minSentenceLength);
    }

    // ── Numeric ──

    public get numbers(): readonly number[] {
        return this._numbers ??= this.computeNumbers();
    }

    public get hasNumbers(): boolean {
        return this.numbers.length > 0;
    }

    public get numericRanges(): readonly { min: number; max: number }[] {
        return this._numericRanges ??= this.computeNumericRanges();
    }

    private computeNumbers(): number[] {
        const raw = this.raw.match(RE.number) ?? [];
        const nums: number[] = [];
        for (const r of raw) {
            const n = Number(r.replace(',', '.'));
            if (!Number.isNaN(n)) nums.push(n);
        }
        return nums;
    }

    private computeNumericRanges(): Array<{ min: number; max: number }> {
        const ranges: Array<{ min: number; max: number }> = [];
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

    public hasToken(token: string): boolean {
        return this.tokenSet.has(token);
    }

    public hasAllTokens(tokens: readonly string[]): boolean {
        return tokens.length > 0 && tokens.every(t => this.tokenSet.has(t));
    }

    public hasAnyToken(tokens: readonly string[]): boolean {
        return tokens.some(t => this.tokenSet.has(t));
    }

    public tokenOverlap(other: SemanticString): number {
        if (this.tokenCount === 0 || other.tokenCount === 0) return 0;
        let count = 0;
        for (const t of this.tokens) {
            if (other.tokenSet.has(t)) count++;
        }
        return count;
    }

    public tokenOverlapRatio(other: SemanticString): number {
        const total = Math.max(this.tokenCount, other.tokenCount);
        return total > 0 ? this.tokenOverlap(other) / total : 0;
    }

    /** Fraction of `reference` tokens found in this string */
    public recallAgainst(reference: SemanticString): number {
        if (reference.tokenCount === 0) return 1;
        let hits = 0;
        for (const t of reference.tokens) {
            if (this.tokenSet.has(t)) hits++;
        }
        return hits / reference.tokenCount;
    }

    /** Fraction of this string's tokens found in `reference` */
    public precisionAgainst(reference: SemanticString): number {
        if (this.tokenCount === 0) return 0;
        let hits = 0;
        for (const t of this.tokens) {
            if (reference.tokenSet.has(t)) hits++;
        }
        return hits / this.tokenCount;
    }

    public isSubsetOf(other: SemanticString): boolean {
        if (this.tokenCount === 0) return false;
        for (const t of this.tokens) {
            if (!other.tokenSet.has(t)) return false;
        }
        return true;
    }

    // ── Negation Detection ──

    public negates(phrase: string): boolean {
        const phraseSS = new SemanticString(phrase);
        if (!phraseSS.phraseTokens.length) return false;

        const userPhraseTokens = this.phraseTokens;
        if (!userPhraseTokens.length) return false;

        const pTokens = phraseSS.phraseTokens;

        for (let i = 0; i < userPhraseTokens.length; i++) {
            if (userPhraseTokens[i] !== pTokens[0]) continue;

            const prev = i > 0 ? userPhraseTokens[i - 1] : '';
            const prevPrev = i > 1 ? userPhraseTokens[i - 2] : '';
            if (!NEGATION_TOKENS.has(prev)) continue;

            // Guard against double-negation forms like "нельзя не ...".
            if (NEGATION_TOKENS.has(prevPrev)) continue;

            if (pTokens.length === 1) return true;

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

            if (matched) return true;
        }

        return false;
    }

    public negatesAny(phrases: readonly string[]): boolean {
        return phrases.some(p => this.negates(p));
    }

    // ── Numeric Constraints ──

    /** Check if `userNum` satisfies the numeric constraints expressed in this text */
    public constraintSatisfiedBy(userNum: number): boolean {
        const refNums = this.numbers;
        if (!refNums.length) return true;

        if (this.numericRanges.some(r => userNum >= r.min && userNum <= r.max)) {
            return true;
        }

        const text = this.lower;
        const hasGte = GTE_PHRASES.some(p => text.includes(p));
        const hasLte = LTE_PHRASES.some(p => text.includes(p));

        const refVal = refNums[0];
        if (hasGte) return userNum >= refVal;
        if (hasLte) return userNum <= refVal;

        return refNums.some(rn => LanguageUtility.numberEq(userNum, rn));
    }

    public satisfiesNumericConstraint(referenceText: string): boolean {
        const ref = new SemanticString(referenceText);
        return this.numbers.every(n => ref.constraintSatisfiedBy(n));
    }

    public numericConsistency(answers: readonly SemanticString[] | readonly string[]): { factor: number; mismatch: boolean } {
        const userNums = this.numbers;
        if (!userNums.length) return { factor: 1.0, mismatch: false };

        const normalizedAnswers = answers.map(a => typeof a === 'string' ? new SemanticString(a) : a);
        const numericAnswers = normalizedAnswers.filter(a => a.hasNumbers);
        if (!numericAnswers.length) return { factor: 1.0, mismatch: false };

        let validCount = 0;
        for (const un of userNums) {
            if (numericAnswers.some(a => a.constraintSatisfiedBy(un))) {
                validCount++;
            }
        }

        const validRatio = validCount / userNums.length;
        if (validRatio >= 1) return { factor: 1.0, mismatch: false };

        const factor = validRatio <= 0 ? 0.55 : (0.55 + 0.45 * validRatio);
        return { factor, mismatch: true };
    }

    public matchesNumber(n: number): boolean {
        return this.numbers.some(own => LanguageUtility.numberEq(own, n));
    }

    // ── Acronym ──

    public get acronym(): string {
        return this.tokens.map(t => t[0]).join('').toLowerCase();
    }

    public matchesAcronymOf(other: SemanticString): boolean {
        const acr = other.acronym;
        if (!acr) return false;
        const norm = LanguageUtility.normalizeRaw(this.raw).toLowerCase();
        return norm === acr || this.hasToken(acr);
    }

    // ── TextRank Summarization (Mihalcea & Tarau, 2004) ──

    public get summary(): readonly string[] {
        return this._summary ??= this.textRank();
    }

    public summarize(topN: number): string[] {
        return this.textRank(topN);
    }

    public get gist(): string {
        return this.summary.join(' ');
    }

    public textRank(
        topN: number = 3,
        options?: Partial<typeof TEXTRANK_DEFAULTS>,
    ): string[] {
        const cfg = { ...TEXTRANK_DEFAULTS, ...options };

        const sentences = [...this.sentences];
        if (sentences.length <= topN) return sentences;

        const tokenSets = sentences.map(s => new Set(new SemanticString(s).tokens));

        const n = sentences.length;
        const sim: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

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
                    if (i === j) continue;
                    const outSum = sim[j].reduce((a, v, k) => k !== j ? a + v : a, 0);
                    if (outSum > 0) {
                        sum += (sim[j][i] / outSum) * scores[j];
                    }
                }
                next[i] = (1 - cfg.damping) / n + cfg.damping * sum;
                maxDelta = Math.max(maxDelta, Math.abs(next[i] - scores[i]));
            }

            scores = next;
            if (maxDelta < cfg.convergence) break;
        }

        const ranked = scores
            .map((score, idx) => ({ score, idx }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topN)
            .map(r => r.idx)
            .sort((a, b) => a - b);

        return ranked.map(idx => sentences[idx]);
    }

    private wordOverlap(a: Set<string>, b: Set<string>): number {
        if (a.size === 0 || b.size === 0) return 0;
        let overlap = 0;
        for (const w of a) {
            if (b.has(w)) overlap++;
        }
        if (overlap === 0) return 0;
        return overlap / (Math.log(a.size) + Math.log(b.size) || 1);
    }

    // ── Length Ratio ──

    public lengthRatio(reference: SemanticString): number {
        return reference.length > 0 ? this.length / reference.length : 1;
    }

    // ── Composition ──

    public append(suffix: string): SemanticString {
        return new SemanticString((this.raw + ' ' + suffix).trim());
    }

    public static from(text: string): SemanticString {
        return new SemanticString(text);
    }

    public static many(texts: readonly string[]): SemanticString[] {
        return texts.map(t => new SemanticString(t));
    }

    // ── String Protocol ──

    public toString(): string {
        return this.raw;
    }

    public valueOf(): string {
        return this.raw;
    }
}
