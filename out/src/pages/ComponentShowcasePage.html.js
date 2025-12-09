import { Page } from "@Purper";
export default class ComponentShowcasePage extends Page {
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
        return Promise.resolve();
    }
}
//# sourceMappingURL=ComponentShowcasePage.html.js.map