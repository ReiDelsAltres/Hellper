import { IElementHolder, Page, RePage, TemplateHolder } from "@Purper";
import PopUp from "../components/PopUp.html.js";
import ReInput from "../components/ReInput.html.js";


@RePage({
    markupURL: "./src/pages/ComponentShowcasePage.html",
    cssURL: "./src/pages/ComponentShowcasePage.html.css",
    jsURL: "./src/pages/ComponentShowcasePage.html.ts",
}, "/components")
export default class ComponentShowcasePage extends Page {
    protected preLoad(holder: TemplateHolder): Promise<void> {
        const root = holder.documentFragment;

        // PopUp demo handlers
        const demoPopup = root.querySelector('#demo-popup') as PopUp | null;
        const demoModal = root.querySelector('#demo-modal') as PopUp | null;
        const demoAnchored = root.querySelector('#demo-anchored') as PopUp | null;

        root.querySelector('#open-popup-btn')?.addEventListener('click', () => demoPopup?.open());
        root.querySelector('#close-popup-btn')?.addEventListener('click', () => demoPopup?.close());

        root.querySelector('#open-modal-btn')?.addEventListener('click', () => demoModal?.open());
        root.querySelector('#close-modal-btn')?.addEventListener('click', () => demoModal?.close());

        // Anchored popup demo
        root.querySelector('#anchor-target')?.addEventListener('click', () => demoAnchored?.toggle());

        // Placement demos
        const placements = ['bottom', 'top', 'left', 'right'] as const;
        for (const placement of placements) {
            const popup = root.querySelector(`#popup-${placement}`) as PopUp | null;
            root.querySelector(`#anchor-${placement}`)?.addEventListener('click', () => popup?.toggle());
        }

        // ReInput interactive demo
        const interactiveInput = root.querySelector('#example-input-interactive') as HTMLElement | null;
        const readBtn = root.querySelector('#read-value-btn') as HTMLElement | null;
        const clearBtn = root.querySelector('#clear-value-btn') as HTMLElement | null;
        const output = root.querySelector('#interactive-value') as HTMLElement | null;

        readBtn?.addEventListener('click', () => {
            if (!interactiveInput) return;
            // the component exposes getValue() but we don't have TS type here – call via any
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const val = (interactiveInput as any).getValue?.() ?? '';
            if (output) output.textContent = val;
        });

        clearBtn?.addEventListener('click', () => {
            if (!interactiveInput) return;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (interactiveInput as any).setValue?.('');
            if (output) output.textContent = '';
        });

        // Number validation demo
        const numberValidationMsg = root.querySelector('#number-validation-msg') as HTMLElement | null;
        ['#input-number-range', '#input-number-step', '#input-number-large'].forEach(selector => {
            const input = root.querySelector(selector) as ReInput | null;
            input?.addEventListener('input-validate', (e: Event) => {
                const detail = (e as CustomEvent).detail;
                if (numberValidationMsg) {
                    numberValidationMsg.textContent = detail.valid ? '✓ Валидно' : `✗ ${detail.message}`;
                    numberValidationMsg.style.color = detail.valid ? 'var(--color-success, #4caf50)' : 'var(--color-error, #f44336)';
                }
            });
        });

        // Date validation demo
        const dateValidationMsg = root.querySelector('#date-validation-msg') as HTMLElement | null;
        ['#input-date-any', '#input-date-2024', '#input-date-past'].forEach(selector => {
            const input = root.querySelector(selector) as ReInput | null;
            input?.addEventListener('input-validate', (e: Event) => {
                const detail = (e as CustomEvent).detail;
                if (dateValidationMsg) {
                    dateValidationMsg.textContent = detail.valid ? '✓ Валидно' : `✗ ${detail.message}`;
                    dateValidationMsg.style.color = detail.valid ? 'var(--color-success, #4caf50)' : 'var(--color-error, #f44336)';
                }
            });
        });

        // Length validation demo
        const lengthValidationMsg = root.querySelector('#length-validation-msg') as HTMLElement | null;
        ['#input-length-range', '#input-length-max', '#input-length-min'].forEach(selector => {
            const input = root.querySelector(selector) as ReInput | null;
            input?.addEventListener('input-validate', (e: Event) => {
                const detail = (e as CustomEvent).detail;
                if (lengthValidationMsg) {
                    lengthValidationMsg.textContent = detail.valid ? '✓ Валидно' : `✗ ${detail.message}`;
                    lengthValidationMsg.style.color = detail.valid ? 'var(--color-success, #4caf50)' : 'var(--color-error, #f44336)';
                }
            });
        });

        // Pattern validation demo
        const patternValidationMsg = root.querySelector('#pattern-validation-msg') as HTMLElement | null;
        ['#input-pattern-letters', '#input-pattern-phone', '#input-pattern-email'].forEach(selector => {
            const input = root.querySelector(selector) as ReInput | null;
            input?.addEventListener('input-validate', (e: Event) => {
                const detail = (e as CustomEvent).detail;
                if (patternValidationMsg) {
                    patternValidationMsg.textContent = detail.valid ? '✓ Валидно' : `✗ ${detail.message}`;
                    patternValidationMsg.style.color = detail.valid ? 'var(--color-success, #4caf50)' : 'var(--color-error, #f44336)';
                }
            });
        });

        return Promise.resolve();
    }
}
