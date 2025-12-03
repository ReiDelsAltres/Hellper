/**
 * KaTeX utility functions for rendering mathematical expressions
 */
export class KatexUtils {
    static isKatexLoaded(): boolean;
    /**
     * Render a single LaTeX expression to an element
     * @param {string} expression - LaTeX expression to render
     * @param {HTMLElement} element - Target element
     * @param {Object} options - KaTeX options
     */
    static renderToElement(expression: string, element: HTMLElement, options?: any): void;
    /**
     * Render LaTeX expression to HTML string
     * @param {string} expression - LaTeX expression to render
     * @param {Object} options - KaTeX options
     * @returns {string} - Rendered HTML
     */
    static renderToString(expression: string, options?: any): string;
    /**
     * Auto-render math expressions in an element
     * @param {HTMLElement} element - Container element to scan for math
     * @param {Object} options - Auto-render options
     */
    static autoRender(element: HTMLElement, options?: any): void;
    /**
     * Initialize KaTeX auto-rendering for the entire document
     * Call this after page content is loaded
     */
    static initAutoRender(): void;
    /**
     * Set up mutation observer to auto-render math in dynamically added content
     */
    static setupMutationObserver(): void;
    /**
     * Validate LaTeX expression syntax
     * @param {string} expression - LaTeX expression to validate
     * @returns {boolean} - true if valid, false if invalid
     */
    static validateExpression(expression: string): boolean;
    /**
     * Convert common mathematical notation to LaTeX
     * @param {string} text - Text with mathematical notation
     * @returns {string} - Text with LaTeX formatting
     */
    static convertToLatex(text: string): string;
}
//# sourceMappingURL=KatexUtils.d.ts.map