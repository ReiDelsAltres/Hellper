// PalettePage.html.js
// Simplified palette page that creates color-palette components
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Page, RePage, setTheme } from "@Purper";
let PalettePage = class PalettePage extends Page {
    async preLoad(holder) {
        const themeMap = {
            "blazor-theme": "Blazor",
            "brass-theme": "Brass",
            "brass-dark-theme": "BrassDark",
            "copper-theme": "Copper",
            "chinese-new-year-theme": "ChineseNewYear",
            "chess-theme": "Chess",
        };
        const items = Array.from(holder.element.querySelectorAll(".palette-item"));
        const applyTheme = (themeName) => {
            setTheme(themeName);
            localStorage.setItem("theme", themeName);
            updateActive(themeName);
        };
        const updateActive = (themeName) => {
            items.forEach((item) => {
                const matched = Array.from(item.classList).some((cls) => themeMap[cls] === themeName);
                item.classList.toggle("active", matched);
            });
        };
        const stored = localStorage.getItem("theme") ?? "Blazor";
        updateActive(stored);
        items.forEach((item) => {
            const themeClass = Array.from(item.classList).find((cls) => themeMap[cls]);
            const themeName = themeClass ? themeMap[themeClass] : undefined;
            if (!themeName)
                return;
            const handler = () => applyTheme(themeName);
            item.addEventListener("click", handler);
            item.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    handler();
                }
            });
        });
        return Promise.resolve();
    }
};
PalettePage = __decorate([
    RePage({
        markupURL: "./src/pages/PalettePage.html",
        cssURL: "./src/pages/PalettePage.html.css",
        jsURL: "./src/pages/PalettePage.html.ts",
        class: PalettePage,
    }, "/palettes")
], PalettePage);
export default PalettePage;
//# sourceMappingURL=PalettePage.html.js.map