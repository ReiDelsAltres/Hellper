/**
 * Применяет правило перенаправления:
 *   /something/foo.ts -> /out/something/foo.js
 */
export declare function rewriteTsToOutJs(url: string): string;
/**
 * Пример использования правила.
 */
export declare function applyRedirect(url: string): {
    shouldRedirect: boolean;
    target: string;
};
/**
 * Переписывает ссылки в DOM, заменяя пути на out/*.js при необходимости.
 */
export declare function rewriteDomLinks(root?: ParentNode): void;
//# sourceMappingURL=redirectRules.d.ts.map