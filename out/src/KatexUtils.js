/**
 * KaTeX utility functions for rendering mathematical expressions
 */
export class KatexUtils {
    static isKatexLoaded() {
        return typeof window.katex !== 'undefined';
    }
    /**
     * Render a single LaTeX expression to an element
     * @param {string} expression - LaTeX expression to render
     * @param {HTMLElement} element - Target element
     * @param {Object} options - KaTeX options
     */
    static renderToElement(expression, element, options = {}) {
        if (!this.isKatexLoaded()) {
            console.warn('KaTeX is not loaded yet');
            return;
        }
        const defaultOptions = {
            throwOnError: false,
            displayMode: false,
            ...options
        };
        try {
            window.katex.render(expression, element, defaultOptions);
        }
        catch (error) {
            console.error('KaTeX rendering error:', error);
            element.textContent = expression; // Fallback to plain text
        }
    }
    /**
     * Render LaTeX expression to HTML string
     * @param {string} expression - LaTeX expression to render
     * @param {Object} options - KaTeX options
     * @returns {string} - Rendered HTML
     */
    static renderToString(expression, options = {}) {
        if (!this.isKatexLoaded()) {
            console.warn('KaTeX is not loaded yet');
            return expression;
        }
        const defaultOptions = {
            throwOnError: false,
            displayMode: false,
            ...options
        };
        try {
            return window.katex.renderToString(expression, defaultOptions);
        }
        catch (error) {
            console.error('KaTeX rendering error:', error);
            return expression; // Fallback to plain text
        }
    }
    /**
     * Render LaTeX inline/display delimiters ($...$ and $$...$$) inside a plain-text
     * string and return the result as an HTML string.
     * Safe to call before the DOM is ready; falls back to the original text when KaTeX
     * is not yet loaded.
     * @param {string} text - Source text that may contain $...$ or $$...$$ regions
     * @param {Object} options - KaTeX options passed to renderToString
     * @returns {string} HTML string with math replaced by KaTeX output
     */
    static renderInlineString(text, options = {}) {
        if (typeof text !== 'string')
            return text;
        if (!this.isKatexLoaded())
            return text;
        const parts = [];
        // Match $$...$$ (display) before $...$ (inline) so we don't split display math
        const regex = /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }
            if (match[1] !== undefined) {
                // $$...$$ — display mode
                parts.push(this.renderToString(match[1].trim(), { ...options, displayMode: true }));
            }
            else {
                // $...$ — inline mode
                parts.push(this.renderToString(match[2].trim(), options));
            }
            lastIndex = regex.lastIndex;
        }
        parts.push(text.slice(lastIndex));
        return parts.join('');
    }
    /**
     * Auto-render math expressions in an element
     * @param {HTMLElement} element - Container element to scan for math
     * @param {Object} options - Auto-render options
     */
    static autoRender(element, options = {}) {
        if (!this.isKatexLoaded() || !window.renderMathInElement) {
            console.warn('KaTeX auto-render is not loaded yet');
            return;
        }
        const defaultOptions = {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\[', right: '\\]', display: true },
                { left: '\\(', right: '\\)', display: false }
            ],
            throwOnError: false,
            output: 'html',
            ...options
        };
        try {
            window.renderMathInElement(element, defaultOptions);
        }
        catch (error) {
            console.error('KaTeX auto-render error:', error);
        }
    }
    /**
     * Initialize KaTeX auto-rendering for the entire document
     * Call this after page content is loaded
     */
    static _initRetries = 0;
    static _observer = null;
    static initAutoRender() {
        if (!this.isKatexLoaded() || !window.renderMathInElement) {
            if (this._initRetries++ < 50) {
                setTimeout(() => this.initAutoRender(), 100);
            }
            return;
        }
        // Auto-render math in the main content area
        const appElement = document.getElementById('app');
        if (appElement) {
            this.autoRender(appElement);
        }
        // Set up observer for dynamic content
        this.setupMutationObserver();
    }
    /**
     * Set up mutation observer to auto-render math in dynamically added content
     */
    static setupMutationObserver() {
        if (this._observer)
            return;
        this._observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.autoRender(node);
                    }
                });
            });
        });
        const appElement = document.getElementById('app');
        if (appElement) {
            this._observer.observe(appElement, {
                childList: true,
                subtree: true
            });
        }
    }
    /**
     * Disconnect the mutation observer
     */
    static disconnectObserver() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }
    /**
     * Validate LaTeX expression syntax
     * @param {string} expression - LaTeX expression to validate
     * @returns {boolean} - true if valid, false if invalid
     */
    static validateExpression(expression) {
        if (!this.isKatexLoaded()) {
            return false;
        }
        try {
            window.katex.renderToString(expression, { throwOnError: true });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Convert common mathematical notation to LaTeX
     * @param {string} text - Text with mathematical notation
     * @returns {string} - Text with LaTeX formatting
     */
    static convertToLatex(text) {
        return text
            // Fractions
            .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
            // Superscripts
            .replace(/\^(\d+)/g, '^{$1}')
            // Subscripts  
            .replace(/_(\d+)/g, '_{$1}')
            // Square roots
            .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
            // Common symbols
            .replace(/alpha/g, '\\alpha')
            .replace(/beta/g, '\\beta')
            .replace(/gamma/g, '\\gamma')
            .replace(/delta/g, '\\delta')
            .replace(/epsilon/g, '\\epsilon')
            .replace(/pi/g, '\\pi')
            .replace(/sigma/g, '\\sigma')
            .replace(/theta/g, '\\theta')
            .replace(/lambda/g, '\\lambda')
            .replace(/mu/g, '\\mu')
            .replace(/infinity/g, '\\infty')
            // Operators
            .replace(/integral/g, '\\int')
            .replace(/sum/g, '\\sum')
            .replace(/product/g, '\\prod')
            .replace(/lim/g, '\\lim');
    }
}
// Make KatexUtils globally available
globalThis.KatexUtils = KatexUtils;
//# sourceMappingURL=KatexUtils.js.map