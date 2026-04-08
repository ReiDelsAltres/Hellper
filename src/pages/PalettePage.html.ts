import { Page, RePage, TemplateHolder, setTheme, activateAppTheme, deactivateAppTheme, activeAppTheme, ACTIVE_THEME_KEY } from "@Purper";
import { COLOR_PALETTES } from "../lib/ColorPalette.js";
import { APP_THEMES } from "../lib/AppTheme.js";
import { PREVIEW_RENDERERS } from "../lib/ThemePreviews.js";

@RePage({
    markupURL: "./src/pages/PalettePage.html",
    cssURL: "./src/pages/PalettePage.html.css",
}, "/palettes")
export default class PalettePage extends Page {
    private paletteGallery?: HTMLElement;
    private themeGallery?: HTMLElement;
    private paletteStyleElements: HTMLStyleElement[] = [];
    private previewHandles = new WeakMap<HTMLElement, { raf?: number, cleanup?: () => void }>();

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        const root = holder.documentFragment;
        this.paletteGallery = root.querySelector('#palette-gallery') as HTMLElement;
        this.themeGallery = root.querySelector('#theme-gallery') as HTMLElement;

        // Load all palette CSS so each preview shows its own colors
        await this.loadAllPaletteStyles();

        this.renderPalettes();
        this.renderThemes();
        this.updateActiveState();

        // React to theme changes
        activeAppTheme.subscribe(() => this.updateActiveState());
    }

    private async loadAllPaletteStyles(): Promise<void> {
        const names = new Set<string>(COLOR_PALETTES.map(p => p.name));
        // Also include palettes referenced by themes so theme previews render correctly
        for (const t of APP_THEMES) names.add(t.palette);

        const loadPromises = Array.from(names).map(async (name) => {
            if (document.querySelector(`style[data-palette-preview="${name}"]`)) return;
            try {
                const response = await fetch(`./resources/${name}.theme.css`);
                if (!response.ok) return;
                const cssText = await response.text();
                const style = document.createElement('style');
                style.dataset.palettePreview = name;
                style.textContent = cssText;
                document.head.appendChild(style);
                this.paletteStyleElements.push(style);
            } catch {
                // Palette CSS not available
            }
        });
        await Promise.all(loadPromises);
    }

    private renderPalettes(): void {
        if (!this.paletteGallery) return;

        for (const palette of COLOR_PALETTES) {
            const themeClass = this.toKebabCase(palette.name) + '-theme';
            const altThemeClass = (palette.name ?? '').toString().toLowerCase() + '-theme';

            const item = document.createElement('div');
            item.className = `gallery-item palette-item ${themeClass} ${altThemeClass}`;
            item.tabIndex = 0;
            item.setAttribute('data-palette', palette.name);

            item.innerHTML = `
                <color-palette class="${themeClass} ${altThemeClass}"></color-palette>
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
            item.addEventListener('keydown', (ev: KeyboardEvent) => {
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

    private renderThemes(): void {
        if (!this.themeGallery) return;

        for (const theme of APP_THEMES) {
            const themeClass = this.toKebabCase(theme.palette) + '-theme';
            const altThemeClass = (theme.palette ?? '').toString().toLowerCase() + '-theme';

            const item = document.createElement('div');
            item.className = `gallery-item theme-item ${themeClass} ${altThemeClass}`;
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
                } else {
                    activateAppTheme(theme.name);
                }
                this.updateActiveState();
            });
            item.addEventListener('keydown', (ev: KeyboardEvent) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    const current = activeAppTheme.getObject();
                    if (current && current.name === theme.name) {
                        deactivateAppTheme();
                    } else {
                        activateAppTheme(theme.name);
                    }
                    this.updateActiveState();
                }
            });

            this.themeGallery.appendChild(item);
            // Start per-item preview effects (snow, neon, etc.) scoped to this item
            try { this.createThemePreview(item, theme); } catch (e) { /* ignore preview failures */ }
        }
    }

    private createThemePreview(item: HTMLElement, theme: any): void {
        const preview = document.createElement('div');
        preview.className = 'preview-overlay';
        item.appendChild(preview);

        const paletteClass = this.toKebabCase(theme.palette) + '-theme';
        const altPaletteClass = (theme.palette ?? '').toString().toLowerCase() + '-theme';
        // ensure the preview element uses both class variants so CSS variables resolve
        preview.classList.add(paletteClass);
        preview.classList.add(altPaletteClass);

        // Short-circuit: if theme provides a preview hook, try calling it
        try {
            const cfg = (theme as any).config ?? theme;
            if (cfg && typeof cfg.previewActivate === 'function') {
                // Allow theme module to render preview into provided container
                const stop = cfg.previewActivate(preview);
                if (typeof stop === 'function') {
                    this.previewHandles.set(preview, { cleanup: () => stop() });
                    return;
                }
            }
        } catch (err) {
            // ignore
        }

        // If a centralized preview renderer exists, use it (e.g., Winter, FirePlace)
        try {
            const renderer = PREVIEW_RENDERERS[(theme.name ?? '').toString()];
            if (typeof renderer === 'function') {
                const stop = renderer(preview);
                if (typeof stop === 'function') {
                    this.previewHandles.set(preview, { cleanup: stop });
                    return;
                }
            }
        } catch (err) {
            // ignore
        }

        // Default built-in previews
        const name = (theme.name ?? '').toString();
        if (name === 'Winter') {
            this.createSnowPreview(preview);
        } else if (name === 'DyBlazor' || theme.palette === 'DyBlazor') {
            this.createDyBlazorPreview(preview);
        } else {
            // simple animated gradient for other themes
            const g = document.createElement('div');
            g.className = 'preview-gradient animated';
            preview.appendChild(g);
        }
    }

    private createSnowPreview(container: HTMLElement): void {
        const flakes: HTMLElement[] = [];
        const count = 8;
        const rect = container.getBoundingClientRect();
        const width = Math.max(120, rect.width || 240);
        const height = Math.max(80, rect.height || 140);

        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'preview-snowflake';
            const x = Math.random() * width;
            const y = Math.random() * height - height;
            el.style.transform = `translate(${x}px, ${y}px)`;
            el.dataset['sx'] = String(x);
            el.dataset['sy'] = String(y);
            el.dataset['sv'] = String(0.6 + Math.random() * 0.9);
            container.appendChild(el);
            flakes.push(el);
        }

        let last = performance.now();
        const animate = (t: number) => {
            const dt = Math.min(40, t - last);
            last = t;
            for (const f of flakes) {
                let x = parseFloat(f.dataset['sx'] || '0');
                let y = parseFloat(f.dataset['sy'] || '0');
                const v = parseFloat(f.dataset['sv'] || '1');
                y += v * (dt * 0.04);
                x += Math.sin((t + x) * 0.001) * 0.6;
                if (y > height + 10) {
                    y = -6 - Math.random() * 20;
                    x = Math.random() * width;
                }
                f.dataset['sx'] = String(x);
                f.dataset['sy'] = String(y);
                f.style.transform = `translate(${x}px, ${y}px)`;
            }
            const raf = requestAnimationFrame(animate);
            this.previewHandles.set(container, { raf, cleanup: () => cancelAnimationFrame(raf) });
        };
        const raf = requestAnimationFrame(animate);
        this.previewHandles.set(container, { raf, cleanup: () => cancelAnimationFrame(raf) });
    }

    private createDyBlazorPreview(container: HTMLElement): void {
        const g = document.createElement('div');
        g.className = 'preview-gradient animated';
        container.appendChild(g);

        const orbs: HTMLElement[] = [];
        const count = 2;
        for (let i = 0; i < count; i++) {
            const o = document.createElement('div');
            o.className = 'preview-orb';
            const r = 24 + Math.random() * 36;
            o.style.width = `${r}px`;
            o.style.height = `${r}px`;
            o.style.left = `${10 + Math.random() * 60}%`;
            o.style.top = `${10 + Math.random() * 60}%`;
            container.appendChild(o);
            orbs.push(o);
        }

        let last = performance.now();
        const animate = (t: number) => {
            const dt = Math.min(40, t - last);
            last = t;
            for (let i = 0; i < orbs.length; i++) {
                const o = orbs[i];
                const dx = Math.sin(t * 0.0012 + i) * 0.6;
                const dy = Math.cos(t * 0.0009 + i) * 0.4;
                const left = parseFloat(o.style.left || '0');
                const top = parseFloat(o.style.top || '0');
                const newLeft = (left + dx) % 100;
                const newTop = (top + dy) % 100;
                o.style.left = `${newLeft}%`;
                o.style.top = `${newTop}%`;
            }
            const raf = requestAnimationFrame(animate);
            this.previewHandles.set(container, { raf, cleanup: () => cancelAnimationFrame(raf) });
        };
        const raf = requestAnimationFrame(animate);
        this.previewHandles.set(container, { raf, cleanup: () => cancelAnimationFrame(raf) });
    }

    private updateActiveState(): void {
        const currentTheme = activeAppTheme.getObject();
        const currentPalette = localStorage.getItem('theme') ?? 'Blazor';

        // Update palette items
        const paletteItems = this.paletteGallery?.querySelectorAll<HTMLElement>('.palette-item') ?? [];
        paletteItems.forEach((item) => {
            const name = item.getAttribute('data-palette');
            const isActive = !currentTheme && name === currentPalette;
            item.classList.toggle('active', isActive);
        });

        // Update theme items
        const themeItems = this.themeGallery?.querySelectorAll<HTMLElement>('.theme-item') ?? [];
        themeItems.forEach((item) => {
            const name = item.getAttribute('data-theme');
            const isActive = currentTheme?.name === name;
            item.classList.toggle('active', isActive);
        });
    }

    private toKebabCase(str: string): string {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
}