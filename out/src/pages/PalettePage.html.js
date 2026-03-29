// PalettePage.html.js
// Palette page that auto-discovers themes from /resources folder
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Page, RePage, setTheme } from "@Purper";
let PalettePage = class PalettePage extends Page {
    gallery;
    themes = [];
    async preLoad(holder) {
        // Hold a reference to gallery element so we can populate it
        this.gallery = holder.documentFragment.querySelector('.palette-gallery') ?? undefined;
        // Auto-discover themes from /resources folder
        await this.discoverThemes();
        // Create palette items dynamically
        this.createPaletteItems();
        // Setup interactions
        this.setupInteractions();
        return Promise.resolve();
    }
    async discoverThemes() {
        // Known theme files in /resources (*.theme.css pattern)
        // Since we can't list directory from browser, we fetch a manifest or use known list
        try {
            // Try to fetch directory listing or use fallback
            const knownThemes = [
                'Blazor',
                'Brass',
                'BrassDark',
                'Chess',
                'Vine'
            ];
            // Verify each theme exists by attempting to fetch
            for (const theme of knownThemes) {
                try {
                    const response = await fetch(`./resources/${theme}.theme.css`, { method: 'HEAD' });
                    if (response.ok) {
                        this.themes.push(theme);
                    }
                }
                catch {
                    // Theme file doesn't exist, skip
                }
            }
            // If no themes found, use fallback
            if (this.themes.length === 0) {
                this.themes = knownThemes;
            }
        }
        catch (e) {
            console.warn('Failed to discover themes:', e);
            this.themes = ['Blazor'];
        }
    }
    createPaletteItems() {
        if (!this.gallery)
            return;
        this.gallery.innerHTML = '';
        for (const theme of this.themes) {
            const themeClass = this.toKebabCase(theme) + '-theme';
            const displayName = this.formatDisplayName(theme);
            const item = document.createElement('div');
            item.className = `palette-item ${themeClass}`;
            item.tabIndex = 0;
            item.setAttribute('aria-label', `${displayName} тема`);
            item.setAttribute('data-theme', theme);
            item.innerHTML = `
                <color-palette class="${themeClass}"></color-palette>
                <div class="palette-info">
                    <div class="palette-label">${displayName}</div>
                    <re-chip color="success" size="small" class="palette-badge">Активна</re-chip>
                </div>
            `;
            this.gallery.appendChild(item);
        }
    }
    setupInteractions() {
        if (!this.gallery)
            return;
        const items = Array.from(this.gallery.querySelectorAll('.palette-item'));
        const applyTheme = (themeName) => {
            setTheme(themeName);
            localStorage.setItem('theme', themeName);
            this.updateActive(themeName, items);
        };
        // Set initial active state
        const stored = localStorage.getItem('theme') ?? 'Blazor';
        this.updateActive(stored, items);
        items.forEach((item) => {
            const themeName = item.getAttribute('data-theme');
            if (!themeName)
                return;
            const handler = () => applyTheme(themeName);
            item.addEventListener('click', handler);
            item.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    handler();
                }
            });
        });
    }
    updateActive(themeName, items) {
        items.forEach((item) => {
            const itemTheme = item.getAttribute('data-theme');
            item.classList.toggle('active', itemTheme === themeName);
        });
    }
    toKebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase();
    }
    formatDisplayName(theme) {
        // Convert "BrassDark" -> "Brass Dark", "ChineseNewYear" -> "Chinese New Year"
        return theme
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
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