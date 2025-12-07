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
        return Promise.resolve();
    }
}
//# sourceMappingURL=ComponentShowcasePage.html.js.map