var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Page, RePage } from "@Purper";
let ComponentShowcasePage = class ComponentShowcasePage extends Page {
    preLoad(holder) {
        const root = holder.element;
        // PopUp demo handlers
        const demoPopup = root.querySelector('#demo-popup');
        const demoModal = root.querySelector('#demo-modal');
        const demoAnchored = root.querySelector('#demo-anchored');
        root.querySelector('#open-popup-btn')?.addEventListener('click', () => demoPopup?.open());
        root.querySelector('#close-popup-btn')?.addEventListener('click', () => demoPopup?.close());
        root.querySelector('#open-modal-btn')?.addEventListener('click', () => demoModal?.open());
        root.querySelector('#close-modal-btn')?.addEventListener('click', () => demoModal?.close());
        // Anchored popup demo
        root.querySelector('#anchor-target')?.addEventListener('click', () => demoAnchored?.toggle());
        // Placement demos
        const placements = ['bottom', 'top', 'left', 'right'];
        for (const placement of placements) {
            const popup = root.querySelector(`#popup-${placement}`);
            root.querySelector(`#anchor-${placement}`)?.addEventListener('click', () => popup?.toggle());
        }
        // ReInput interactive demo
        const interactiveInput = root.querySelector('#example-input-interactive');
        const readBtn = root.querySelector('#read-value-btn');
        const clearBtn = root.querySelector('#clear-value-btn');
        const output = root.querySelector('#interactive-value');
        readBtn?.addEventListener('click', () => {
            if (!interactiveInput)
                return;
            // the component exposes getValue() but we don't have TS type here – call via any
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const val = interactiveInput.getValue?.() ?? '';
            if (output)
                output.textContent = val;
        });
        clearBtn?.addEventListener('click', () => {
            if (!interactiveInput)
                return;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            interactiveInput.setValue?.('');
            if (output)
                output.textContent = '';
        });
        // Number validation demo
        const numberValidationMsg = root.querySelector('#number-validation-msg');
        ['#input-number-range', '#input-number-step', '#input-number-large'].forEach(selector => {
            const input = root.querySelector(selector);
            input?.addEventListener('input-validate', (e) => {
                const detail = e.detail;
                if (numberValidationMsg) {
                    numberValidationMsg.textContent = detail.valid ? '✓ Валидно' : `✗ ${detail.message}`;
                    numberValidationMsg.style.color = detail.valid ? 'var(--color-success, #4caf50)' : 'var(--color-error, #f44336)';
                }
            });
        });
        // Date validation demo
        const dateValidationMsg = root.querySelector('#date-validation-msg');
        ['#input-date-any', '#input-date-2024', '#input-date-past'].forEach(selector => {
            const input = root.querySelector(selector);
            input?.addEventListener('input-validate', (e) => {
                const detail = e.detail;
                if (dateValidationMsg) {
                    dateValidationMsg.textContent = detail.valid ? '✓ Валидно' : `✗ ${detail.message}`;
                    dateValidationMsg.style.color = detail.valid ? 'var(--color-success, #4caf50)' : 'var(--color-error, #f44336)';
                }
            });
        });
        // Length validation demo
        const lengthValidationMsg = root.querySelector('#length-validation-msg');
        ['#input-length-range', '#input-length-max', '#input-length-min'].forEach(selector => {
            const input = root.querySelector(selector);
            input?.addEventListener('input-validate', (e) => {
                const detail = e.detail;
                if (lengthValidationMsg) {
                    lengthValidationMsg.textContent = detail.valid ? '✓ Валидно' : `✗ ${detail.message}`;
                    lengthValidationMsg.style.color = detail.valid ? 'var(--color-success, #4caf50)' : 'var(--color-error, #f44336)';
                }
            });
        });
        // Pattern validation demo
        const patternValidationMsg = root.querySelector('#pattern-validation-msg');
        ['#input-pattern-letters', '#input-pattern-phone', '#input-pattern-email'].forEach(selector => {
            const input = root.querySelector(selector);
            input?.addEventListener('input-validate', (e) => {
                const detail = e.detail;
                if (patternValidationMsg) {
                    patternValidationMsg.textContent = detail.valid ? '✓ Валидно' : `✗ ${detail.message}`;
                    patternValidationMsg.style.color = detail.valid ? 'var(--color-success, #4caf50)' : 'var(--color-error, #f44336)';
                }
            });
        });
        return Promise.resolve();
    }
};
ComponentShowcasePage = __decorate([
    RePage({
        markupURL: "./src/pages/ComponentShowcasePage.html",
        cssURL: "./src/pages/ComponentShowcasePage.html.css",
        jsURL: "./src/pages/ComponentShowcasePage.html.ts",
        class: ComponentShowcasePage,
    }, "/components")
], ComponentShowcasePage);
export default ComponentShowcasePage;
//# sourceMappingURL=ComponentShowcasePage.html.js.map