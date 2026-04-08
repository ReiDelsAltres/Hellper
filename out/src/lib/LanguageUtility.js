// ===== Regex Patterns =====
export const RE = {
    /** Match Cyrillic/Latin words ≥ 3 chars (for content tokenization) */
    contentWord: /[а-яёa-z]{3,}/gi,
    /** Match Cyrillic/Latin words ≥ 2 chars (for phrase tokenization) */
    phraseWord: /[а-яёa-z]{2,}/gi,
    /** Match numbers with optional decimal separator */
    number: /\d+(?:[.,]\d+)?/g,
    /** Split text into sentences at . ! ? ; followed by whitespace, or at newlines */
    sentenceSplit: /(?<=[.!?;])\s+|(?<=\n)/,
    /** Range pattern: "от X до Y" */
    rangeBetween: /от\s+(\d+(?:[.,]\d+)?)\s+до\s+(\d+(?:[.,]\d+)?)/g,
    /** Range pattern: "X – Y" or "X - Y" */
    rangeDash: /(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)/g,
    /** ё → е normalization */
    yo: /ё/g,
    /** Strip non-alphanumeric (Cyrillic + Latin + digits + hyphen) */
    nonAlphaHyphen: /[^а-яёa-z0-9\-]/g,
    /** Strip non-alphanumeric (Cyrillic + Latin + digits, no hyphen) */
    nonAlpha: /[^а-яёa-z0-9]/g,
};
// ===== Stopwords =====
export const STOPWORDS = new Set([
    // Russian
    'и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то', 'все',
    'она', 'так', 'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по',
    'ее', 'мне', 'было', 'вот', 'от', 'меня', 'еще', 'нет', 'о', 'из', 'ему',
    'теперь', 'когда', 'даже', 'ну', 'вдруг', 'ли', 'если', 'уже', 'или', 'ни',
    'быть', 'был', 'него', 'до', 'вас', 'нибудь', 'опять', 'уж', 'вам', 'такой',
    'тогда', 'который', 'этот', 'того', 'потому', 'этого', 'какой', 'совсем', 'ним',
    'здесь', 'этом', 'один', 'почти', 'мой', 'тем', 'чтобы', 'нее', 'сейчас', 'были',
    'куда', 'зачем', 'при', 'всех', 'ничего', 'раз', 'только', 'больше', 'менее', 'сам',
    // English
    'the', 'and', 'is', 'in', 'it', 'you', 'of', 'for', 'on', 'with', 'as', 'this',
    'that', 'a', 'an', 'are', 'be', 'was', 'were', 'to', 'from', 'by', 'or', 'at',
    'which', 'but', 'have', 'has', 'had',
]);
// ===== Negation =====
export const NEGATION_TOKENS = new Set(['не', 'нет', 'нельзя', 'not', 'no', 'never']);
// ===== Numeric Constraint Phrases =====
export const GTE_PHRASES = [
    'не менее', 'не меньше', 'минимум', 'как минимум',
    'не менее чем', 'по крайней мере', 'at least', 'minimum',
];
export const LTE_PHRASES = [
    'не более', 'не больше', 'максимум',
    'не превышает', 'не превышать', 'at most', 'maximum',
];
// ===== Suffix Stripping =====
export const SUFFIXES_RU = [
    // длинные (4+ символов) — проверяются первыми
    'иями', 'анием', 'ение', 'ения', 'ости', 'ость',
    // 3 символа
    'ами', 'ями', 'ого', 'его', 'ому', 'ему', 'ыми', 'ими',
    'ых', 'их', 'ах', 'ях', 'ия', 'ии', 'ие', 'ий', 'ья', 'ье',
    // 2 символа
    'ая', 'ое', 'ые', 'ым', 'им', 'ом', 'ем', 'ой', 'ый',
    'ам', 'ям', 'ов', 'ев',
];
export const SUFFIXES_EN = ['tion', 'ing', 'ed', 's'];
export const SUFFIXES = [...SUFFIXES_RU, ...SUFFIXES_EN];
// ===== TextRank (Mihalcea & Tarau, 2004) =====
export const TEXTRANK_DEFAULTS = {
    damping: 0.85,
    convergence: 1e-4,
    maxIterations: 50,
    minSentenceLength: 10,
};
// ===== Small Pure Functions =====
export default class LanguageUtility {
    static normalizeRaw(word) {
        return word.toLowerCase().replace(RE.yo, 'е').replace(RE.nonAlphaHyphen, '');
    }
    static normalizeWord(word) {
        let w = LanguageUtility.normalizeRaw(word);
        if (!w)
            return '';
        for (const suf of SUFFIXES) {
            if (w.length - suf.length >= 3 && w.endsWith(suf)) {
                w = w.slice(0, w.length - suf.length);
                break;
            }
        }
        w = w.replace(RE.nonAlpha, '');
        return w;
    }
    static numberEq(a, b) {
        return Math.abs(a - b) < 1e-6;
    }
}
//# sourceMappingURL=LanguageUtility.js.map