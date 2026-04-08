import { TEXTRANK_DEFAULTS } from "./LanguageUtility.js";
export default class SemanticString {
    /** Original raw text */
    readonly raw: string;
    private _lower;
    private _normalized;
    private _tokens;
    private _tokenSet;
    private _phraseTokens;
    private _sentences;
    private _numbers;
    private _numericRanges;
    private _summary;
    constructor(text: string);
    get length(): number;
    get isEmpty(): boolean;
    get trimmed(): string;
    get lower(): string;
    get normalized(): string;
    get tokens(): readonly string[];
    get tokenSet(): ReadonlySet<string>;
    get tokenCount(): number;
    /**
     * Content-only text: normalized, stopword-filtered tokens joined as a string.
     * Use this for embedding calculations so that filler / low-meaning words
     * don't overly influence semantic similarity measurements.
     */
    get content(): string;
    get phraseTokens(): readonly string[];
    private computeTokens;
    private computePhraseTokens;
    get sentences(): readonly string[];
    get sentenceCount(): number;
    /** Sentence-level parts split at . ! ? (not filtered by length) */
    get clauses(): string[];
    private computeSentences;
    get numbers(): readonly number[];
    get hasNumbers(): boolean;
    get numericRanges(): readonly {
        min: number;
        max: number;
    }[];
    private computeNumbers;
    private computeNumericRanges;
    hasToken(token: string): boolean;
    hasAllTokens(tokens: readonly string[]): boolean;
    hasAnyToken(tokens: readonly string[]): boolean;
    tokenOverlap(other: SemanticString): number;
    tokenOverlapRatio(other: SemanticString): number;
    /** Fraction of `reference` tokens found in this string */
    recallAgainst(reference: SemanticString): number;
    /** Fraction of this string's tokens found in `reference` */
    precisionAgainst(reference: SemanticString): number;
    isSubsetOf(other: SemanticString): boolean;
    negates(phrase: string): boolean;
    negatesAny(phrases: readonly string[]): boolean;
    /** Check if `userNum` satisfies the numeric constraints expressed in this text */
    constraintSatisfiedBy(userNum: number): boolean;
    satisfiesNumericConstraint(referenceText: string): boolean;
    numericConsistency(answers: readonly SemanticString[] | readonly string[]): {
        factor: number;
        mismatch: boolean;
    };
    matchesNumber(n: number): boolean;
    get acronym(): string;
    matchesAcronymOf(other: SemanticString): boolean;
    get summary(): readonly string[];
    summarize(topN: number): string[];
    get gist(): string;
    textRank(topN?: number, options?: Partial<typeof TEXTRANK_DEFAULTS>): string[];
    private wordOverlap;
    lengthRatio(reference: SemanticString): number;
    append(suffix: string): SemanticString;
    static from(text: string): SemanticString;
    static many(texts: readonly string[]): SemanticString[];
    toString(): string;
    valueOf(): string;
}
//# sourceMappingURL=SemanticString.d.ts.map