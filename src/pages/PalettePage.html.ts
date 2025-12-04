// PalettePage.html.js
// Simplified palette page that creates color-palette components

import { IElementHolder, Page, setTheme } from "@Purper";

export default class PalettePage extends Page {
  protected preLoad(holder: IElementHolder): Promise<void> {
        const themeMap: Record<string, string> = {
            "blazor-theme": "Blazor",
            "brass-theme": "Brass",
            "chess-theme": "Chess",
        };

        const items = Array.from(holder.element.querySelectorAll<HTMLElement>(".palette-item"));

        const applyTheme = (themeName: string) => {
            setTheme(themeName);
            localStorage.setItem("theme", themeName);
            updateActive(themeName);
        };

        const updateActive = (themeName: string) => {
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
            if (!themeName) return;

            const handler = () => applyTheme(themeName);
            item.addEventListener("click", handler);
            item.addEventListener("keydown", (ev: KeyboardEvent) => {
                if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    handler();
                }
            });
        });

    return Promise.resolve();
  }
}