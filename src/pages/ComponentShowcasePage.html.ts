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

        return Promise.resolve();
    }
}
