// PalettePage.html.js
// Palette page that auto-discovers themes from /resources folder

import { Fetcher, IElementHolder, Page, RePage, setTheme, TemplateHolder } from "@Purper";

@RePage({
    markupURL: "./src/pages/PalettePage.html",
    cssURL: "./src/pages/PalettePage.html.css",
    jsURL: "./src/pages/PalettePage.html.ts",
    class: PalettePage,
}, "/palettes")
export default class PalettePage extends Page {
    private gallery?: HTMLElement;
    private themes: string[] = [];

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        // Hold a reference to gallery element so we can populate it
        this.gallery = holder.documentFragment.querySelector('.palette-gallery') as HTMLElement | null ?? undefined;

        // Auto-discover themes from /resources folder
        await this.discoverThemes();
        
        // Create palette items dynamically
        this.createPaletteItems();
        
        // Setup interactions
        this.setupInteractions();

        return Promise.resolve();
    }

    private async discoverThemes(): Promise<void> {
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
                } catch {
                    // Theme file doesn't exist, skip
                }
            }
            
            // If no themes found, use fallback
            if (this.themes.length === 0) {
                this.themes = knownThemes;
            }
        } catch (e) {
            console.warn('Failed to discover themes:', e);
            this.themes = ['Blazor'];
        }
    }

    private createPaletteItems(): void {
        if (!this.gallery) return;

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

    private setupInteractions(): void {
        if (!this.gallery) return;

        const items = Array.from(this.gallery.querySelectorAll<HTMLElement>('.palette-item'));
        
        const applyTheme = (themeName: string) => {
            setTheme(themeName);
            localStorage.setItem('theme', themeName);
            this.updateActive(themeName, items);
        };

        // Set initial active state
        const stored = localStorage.getItem('theme') ?? 'Blazor';
        this.updateActive(stored, items);

        items.forEach((item) => {
            const themeName = item.getAttribute('data-theme');
            if (!themeName) return;

            const handler = () => applyTheme(themeName);
            item.addEventListener('click', handler);
            item.addEventListener('keydown', (ev: KeyboardEvent) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    handler();
                }
            });
        });
    }

    private updateActive(themeName: string, items: HTMLElement[]): void {
        items.forEach((item) => {
            const itemTheme = item.getAttribute('data-theme');
            item.classList.toggle('active', itemTheme === themeName);
        });
    }

    private toKebabCase(str: string): string {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase();
    }

    private formatDisplayName(theme: string): string {
        // Convert "BrassDark" -> "Brass Dark", "ChineseNewYear" -> "Chinese New Year"
        return theme
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
    }
}