// PalettePage.html.js
// Simplified palette page that creates color-palette components
import { Page, setTheme } from "@Purper";
export default class PalettePage extends Page {
    preLoad(holder) {
        const themeMap = {
            "blazor-theme": "Blazor",
            "brass-theme": "Brass",
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
}
//# sourceMappingURL=PalettePage.html.js.map