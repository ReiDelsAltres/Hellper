export declare const RE: {
    /** Match Cyrillic/Latin words ≥ 3 chars (for content tokenization) */
    contentWord: RegExp;
    /** Match Cyrillic/Latin words ≥ 2 chars (for phrase tokenization) */
    phraseWord: RegExp;
    /** Match numbers with optional decimal separator */
    number: RegExp;
    /** Split text into sentences at . ! ? ; followed by whitespace, or at newlines */
    sentenceSplit: RegExp;
    /** Range pattern: "от X до Y" */
    rangeBetween: RegExp;
    /** Range pattern: "X – Y" or "X - Y" */
    rangeDash: RegExp;
    /** ё → е normalization */
    yo: RegExp;
    /** Strip non-alphanumeric (Cyrillic + Latin + digits + hyphen) */
    nonAlphaHyphen: RegExp;
    /** Strip non-alphanumeric (Cyrillic + Latin + digits, no hyphen) */
    nonAlpha: RegExp;
};
export declare const STOPWORDS: Set<string>;
export declare const NEGATION_TOKENS: Set<string>;
export declare const GTE_PHRASES: string[];
export declare const LTE_PHRASES: string[];
export declare const SUFFIXES_RU: string[];
export declare const SUFFIXES_EN: string[];
export declare const SUFFIXES: string[];
export declare const TEXTRANK_DEFAULTS: {
    damping: number;
    convergence: number;
    maxIterations: number;
    minSentenceLength: number;
};
export default class LanguageUtility {
    static normalizeRaw(word: string): string;
    static normalizeWord(word: string): string;
    static numberEq(a: number, b: number): boolean;
}
//# sourceMappingURL=LanguageUtility.d.ts.map