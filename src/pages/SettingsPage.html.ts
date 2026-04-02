import { Page, RePage, ServiceWorker, TemplateHolder } from "@Purper";
import ReButton from "../components/ReButton.html.js";
import ReButtonGroup from "../components/ReButtonGroup.html.js";

@RePage({
    markupURL: "./src/pages/SettingsPage.hmle",
    cssURL: "./src/pages/SettingsPage.html.css",
}, "/settings")
export default class SettingsPage extends Page {
    private strategyGroup?: ReButtonGroup;
    private precacheGroup?: ReButtonGroup;

    protected async postLoad(holder: TemplateHolder): Promise<void> {
        const currentStrategy = ServiceWorker.cacheStrategy.getObject();
        const currentPrecache = ServiceWorker.precacheMode.getObject();

        if (this.strategyGroup?.buttonMap) {
            this.updateGroupSelection(this.strategyGroup.buttonMap, currentStrategy!);
        }
        if (this.precacheGroup?.buttonMap) {
            this.updateGroupSelection(this.precacheGroup.buttonMap, currentPrecache!);
        }
    }

    public onStrategyChange(event: CustomEvent<{}>): void {
        const buttons = (event.detail as any).buttons as Map<ReButton, boolean>;
        buttons.forEach((isSelected, btn) => {
            btn.Variant.setObject(isSelected ? 'filled' : 'outlined');
            if (isSelected) {
                const value = btn.getAttribute('value') as 'cache-first' | 'network-first';
                if (value) ServiceWorker.setCacheStrategy(value);
            }
        });
    }

    public onPrecacheModeChange(event: CustomEvent<{}>): void {
        const buttons = (event.detail as any).buttons as Map<ReButton, boolean>;
        buttons.forEach((isSelected, btn) => {
            btn.Variant.setObject(isSelected ? 'filled' : 'outlined');
            if (isSelected) {
                const value = btn.getAttribute('value') as 'precache' | 'normal' | 'disabled';
                if (value) ServiceWorker.setPrecacheMode(value);
            }
        });
    }

    private updateGroupSelection(buttons: Map<ReButton, boolean>, selectedValue: string): void {
        buttons.forEach((_, btn) => {
            const isMatch = btn.getAttribute('value') === selectedValue;
            btn.Variant.setObject(isMatch ? 'filled' : 'outlined');
        });
    }
}
