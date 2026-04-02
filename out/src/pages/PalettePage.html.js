var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Page, RePage, setTheme, activateAppTheme, deactivateAppTheme, activeAppTheme } from "@Purper";
import { COLOR_PALETTES } from "../lib/ColorPalette.js";
import { APP_THEMES } from "../lib/AppTheme.js";
let PalettePage = class PalettePage extends Page {
    paletteGallery;
    themeGallery;
    async preLoad(holder) {
        const root = holder.documentFragment;
        this.paletteGallery = root.querySelector('#palette-gallery');
        this.themeGallery = root.querySelector('#theme-gallery');
        this.renderPalettes();
        this.renderThemes();
        this.updateActiveState();
        // React to theme changes
        activeAppTheme.subscribe(() => this.updateActiveState());
    }
    renderPalettes() {
        if (!this.paletteGallery)
            return;
        for (const palette of COLOR_PALETTES) {
            const themeClass = this.toKebabCase(palette.name) + '-theme';
            const item = document.createElement('div');
            item.className = `gallery-item palette-item ${themeClass}`;
            item.tabIndex = 0;
            item.setAttribute('data-palette', palette.name);
            item.innerHTML = `
                <color-palette class="${themeClass}"></color-palette>
                <div class="item-info">
                    <span class="item-label">${palette.displayName}</span>
                    <re-chip color="success" size="small" class="active-badge">Активна</re-chip>
                </div>
            `;
            item.addEventListener('click', () => {
                setTheme(palette.name);
                localStorage.setItem('theme', palette.name);
                this.updateActiveState();
            });
            item.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    setTheme(palette.name);
                    localStorage.setItem('theme', palette.name);
                    this.updateActiveState();
                }
            });
            this.paletteGallery.appendChild(item);
        }
    }
    renderThemes() {
        if (!this.themeGallery)
            return;
        for (const theme of APP_THEMES) {
            const themeClass = this.toKebabCase(theme.palette) + '-theme';
            const item = document.createElement('div');
            item.className = `gallery-item theme-item ${themeClass}`;
            item.tabIndex = 0;
            item.setAttribute('data-theme', theme.name);
            item.innerHTML = `
                <color-palette class="${themeClass}"></color-palette>
                <div class="item-info">
                    <div class="item-label-row">
                        <re-icon icon="auto_awesome" size="small" color="tertiary"></re-icon>
                        <span class="item-label">${theme.displayName}</span>
                    </div>
                    <re-chip color="tertiary" size="small" class="active-badge">Активна</re-chip>
                </div>
            `;
            item.addEventListener('click', () => {
                const current = activeAppTheme.getObject();
                if (current && current.name === theme.name) {
                    // Clicking active theme deactivates it
                    deactivateAppTheme();
                }
                else {
                    activateAppTheme(theme.name);
                }
                this.updateActiveState();
            });
            item.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    const current = activeAppTheme.getObject();
                    if (current && current.name === theme.name) {
                        deactivateAppTheme();
                    }
                    else {
                        activateAppTheme(theme.name);
                    }
                    this.updateActiveState();
                }
            });
            this.themeGallery.appendChild(item);
        }
    }
    updateActiveState() {
        const currentTheme = activeAppTheme.getObject();
        const currentPalette = localStorage.getItem('theme') ?? 'Blazor';
        // Update palette items
        const paletteItems = this.paletteGallery?.querySelectorAll('.palette-item') ?? [];
        paletteItems.forEach((item) => {
            const name = item.getAttribute('data-palette');
            const isActive = !currentTheme && name === currentPalette;
            item.classList.toggle('active', isActive);
        });
        // Update theme items
        const themeItems = this.themeGallery?.querySelectorAll('.theme-item') ?? [];
        themeItems.forEach((item) => {
            const name = item.getAttribute('data-theme');
            const isActive = currentTheme?.name === name;
            item.classList.toggle('active', isActive);
        });
    }
    toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
};
PalettePage = __decorate([
    RePage({
        markupURL: "./src/pages/PalettePage.html",
        cssURL: "./src/pages/PalettePage.html.css",
    }, "/palettes")
], PalettePage);
export default PalettePage;
//# sourceMappingURL=PalettePage.html.js.map