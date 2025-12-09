import { IElementHolder, Page } from "@Purper";
import PopUp from "../components/PopUp.html.js";

export default class ComponentShowcasePage extends Page {
    protected preLoad(holder: IElementHolder): Promise<void> {
        const root = holder.element;

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

        return Promise.resolve();
    }
}
