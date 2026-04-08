export type PreviewCleanup = () => void;

let injected = false;
function injectStyles() {
    if (injected) return;
    injected = true;
    const css = `
.theme-preview-overlay {
  position: absolute;
  inset: 8px;
  pointer-events: none;
  z-index: 20;
  border-radius: 12px;
  overflow: hidden;
}

/* Winter preview small snow */
.winter-preview .winter-flake {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.85);
  opacity: 0.9;
  transform: translate3d(0,0,0);
}

/* FirePlace preview (warm animated gradient + soft embers) */
.fireplace-preview {
    position: absolute;
    inset: 8px;
    pointer-events: none;
    z-index: 18;
    border-radius: 12px;
    overflow: hidden;
}
.fireplace-preview .fp-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(212,81,30,0.18) 0%, rgba(255,140,56,0.08) 40%, transparent 75%);
    animation: fpGlow 4s ease-in-out infinite alternate;
}
@keyframes fpGlow {
    0% { opacity: 0.7; }
    100% { opacity: 1; }
}
.fireplace-preview .fp-ember {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    box-shadow: 0 0 4px rgba(255,140,56,0.4);
}
`;
    const el = document.createElement('style');
    el.dataset.themePreviews = '1';
    el.textContent = css;
    document.head.appendChild(el);
}

export const PREVIEW_RENDERERS: Record<string, (container: HTMLElement) => PreviewCleanup> = {
    Winter(container: HTMLElement) {
        injectStyles();
        const overlay = document.createElement('div');
        overlay.className = 'theme-preview-overlay winter-preview';
        overlay.style.pointerEvents = 'none';

        // place inside container (item) so colors apply via class on item
        container.appendChild(overlay);

        const flakes: { el: HTMLDivElement; x: number; y: number; vy: number; vx: number; }[] = [];
        const count = Math.max(4, Math.min(10, Math.floor(container.clientWidth / 40)));
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'winter-flake';
            const w = 4 + Math.random() * 8;
            el.style.width = `${w}px`;
            el.style.height = `${w}px`;
            overlay.appendChild(el);
            flakes.push({ el, x: Math.random() * overlay.clientWidth, y: Math.random() * overlay.clientHeight, vy: 0.3 + Math.random() * 0.8, vx: (Math.random() - 0.5) * 0.2 });
        }

        let raf: number | null = null;
        function animate() {
            for (const f of flakes) {
                f.y += f.vy;
                f.x += f.vx + Math.sin(f.y * 0.05) * 0.3;
                if (f.y > overlay.clientHeight + 10) {
                    f.y = -10;
                    f.x = Math.random() * overlay.clientWidth;
                }
                f.el.style.transform = `translate(${Math.round(f.x)}px, ${Math.round(f.y)}px)`;
            }
            raf = requestAnimationFrame(animate);
        }
        raf = requestAnimationFrame(animate);

        return () => {
            if (raf) cancelAnimationFrame(raf);
            flakes.forEach(f => { try { f.el.remove(); } catch { } });
            try { overlay.remove(); } catch { }
        };
    },

    FirePlace(container: HTMLElement) {
        injectStyles();
        const overlay = document.createElement('div');
        overlay.className = 'fireplace-preview';
        overlay.style.pointerEvents = 'none';
        container.appendChild(overlay);
        const grad = document.createElement('div');
        grad.className = 'fp-gradient';
        overlay.appendChild(grad);

        const COLORS = ['rgba(212,81,30,', 'rgba(255,140,56,', 'rgba(255,190,79,', 'rgba(184,58,26,'];
        const embers: { el: HTMLDivElement; x: number; y: number; vy: number; drift: number; opacity: number; flicker: number; }[] = [];
        const count = Math.max(4, Math.min(8, Math.floor(container.clientWidth / 35)));
        const w = overlay.clientWidth || 240;
        const h = overlay.clientHeight || 160;

        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'fp-ember';
            const r = 2 + Math.random() * 3;
            const opacity = 0.4 + Math.random() * 0.5;
            const c = COLORS[Math.floor(Math.random() * COLORS.length)];
            el.style.width = `${r * 2}px`;
            el.style.height = `${r * 2}px`;
            el.style.background = `radial-gradient(circle, ${c}${opacity}) 0%, ${c}${opacity * 0.2}) 70%, transparent 100%)`;
            overlay.appendChild(el);
            embers.push({ el, x: Math.random() * w, y: h + Math.random() * 30, vy: 0.3 + Math.random() * 0.6, drift: (Math.random() - 0.5) * 0.3, opacity, flicker: Math.random() * Math.PI * 2 });
        }

        let raf: number | null = null;
        function animate() {
            for (const e of embers) {
                e.y -= e.vy;
                e.x += e.drift + Math.sin(e.y * 0.04 + e.flicker) * 0.3;
                const progress = 1 - (e.y / h);
                const curOp = Math.max(0, e.opacity * (1 - progress * 0.8));
                e.el.style.opacity = String(curOp);
                if (e.y < -8 || curOp < 0.02) {
                    e.y = h + 5 + Math.random() * 20;
                    e.x = Math.random() * w;
                    e.opacity = 0.4 + Math.random() * 0.5;
                }
                e.el.style.transform = `translate(${Math.round(e.x)}px, ${Math.round(e.y)}px)`;
            }
            raf = requestAnimationFrame(animate);
        }
        raf = requestAnimationFrame(animate);

        return () => {
            if (raf) cancelAnimationFrame(raf);
            embers.forEach(e => { try { e.el.remove(); } catch { } });
            try { overlay.remove(); } catch { }
        };
    }
};
