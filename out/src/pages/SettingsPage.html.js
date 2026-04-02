var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Page, RePage, ServiceWorker } from "@Purper";
let SettingsPage = class SettingsPage extends Page {
    strategyGroup;
    precacheGroup;
    async postLoad(holder) {
        const currentStrategy = ServiceWorker.cacheStrategy.getObject();
        const currentPrecache = ServiceWorker.precacheMode.getObject();
        if (this.strategyGroup?.buttonMap) {
            this.updateGroupSelection(this.strategyGroup.buttonMap, currentStrategy);
        }
        if (this.precacheGroup?.buttonMap) {
            this.updateGroupSelection(this.precacheGroup.buttonMap, currentPrecache);
        }
    }
    onStrategyChange(event) {
        const buttons = event.detail.buttons;
        buttons.forEach((isSelected, btn) => {
            btn.Variant.setObject(isSelected ? 'filled' : 'outlined');
            if (isSelected) {
                const value = btn.getAttribute('value');
                if (value)
                    ServiceWorker.setCacheStrategy(value);
            }
        });
    }
    onPrecacheModeChange(event) {
        const buttons = event.detail.buttons;
        buttons.forEach((isSelected, btn) => {
            btn.Variant.setObject(isSelected ? 'filled' : 'outlined');
            if (isSelected) {
                const value = btn.getAttribute('value');
                if (value)
                    ServiceWorker.setPrecacheMode(value);
            }
        });
    }
    updateGroupSelection(buttons, selectedValue) {
        buttons.forEach((_, btn) => {
            const isMatch = btn.getAttribute('value') === selectedValue;
            btn.Variant.setObject(isMatch ? 'filled' : 'outlined');
        });
    }
};
SettingsPage = __decorate([
    RePage({
        markupURL: "./src/pages/SettingsPage.hmle",
        cssURL: "./src/pages/SettingsPage.html.css",
    }, "/settings")
], SettingsPage);
export default SettingsPage;
//# sourceMappingURL=SettingsPage.html.js.map