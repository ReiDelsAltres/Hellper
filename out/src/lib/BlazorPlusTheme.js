import { defineAppTheme } from "./AppTheme.js";
let particlesOverlay = null;
let animationFrame = null;
function createParticlesOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'blazor-plus-particles-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        overflow: hidden;
    `;
    document.body.appendChild(overlay);
    return overlay;
}
function startParticles() {
    particlesOverlay = createParticlesOverlay();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const particles = [];
    const COLORS = ['#7c3aed', '#ec4899', '#06b6d4', '#3b82f6', '#10b981', '#f59e0b'];
    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
        const el = document.createElement('div');
        const color = COLORS[i % COLORS.length];
        const size = 1.5 + Math.random() * 3;
        el.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            box-shadow: 0 0 12px ${color}, 0 0 20px ${color}88;
            pointer-events: none;
        `;
        particlesOverlay.appendChild(el);
        particles.push({
            el,
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            color,
            size,
        });
    }
    const trails = [];
    let frameCount = 0;
    const animate = () => {
        frameCount++;
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            // Bounce off walls
            if (p.x <= 0 || p.x >= w)
                p.vx *= -1;
            if (p.y <= 0 || p.y >= h)
                p.vy *= -1;
            p.x = Math.max(0, Math.min(w, p.x));
            p.y = Math.max(0, Math.min(h, p.y));
            p.el.style.transform = `translate(${p.x - p.size / 2}px, ${p.y - p.size / 2}px)`;
            // Create trail
            if (frameCount % 5 === 0) {
                const trail = document.createElement('div');
                const trailSize = p.size * 0.6;
                trail.style.cssText = `
                    position: absolute;
                    width: ${trailSize}px;
                    height: ${trailSize}px;
                    background: ${p.color};
                    border-radius: 50%;
                    pointer-events: none;
                `;
                particlesOverlay.appendChild(trail);
                trail.style.transform = `translate(${p.x - trailSize / 2}px, ${p.y - trailSize / 2}px)`;
                trails.push({ el: trail, age: 0 });
            }
        }
        // Update trails
        for (let i = trails.length - 1; i >= 0; i--) {
            const t = trails[i];
            t.age++;
            const opacity = Math.max(0, 1 - t.age / 20);
            t.el.style.opacity = String(opacity);
            if (t.age > 20) {
                t.el.remove();
                trails.splice(i, 1);
            }
        }
        animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
}
function stopParticles() {
    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    if (particlesOverlay) {
        particlesOverlay.remove();
        particlesOverlay = null;
    }
}
const BlazorPlusTheme = defineAppTheme({
    name: 'BlazorPlus',
    palette: 'BlazorPlus',
    onActivate: () => startParticles(),
    onDeactivate: () => stopParticles(),
});
export default BlazorPlusTheme;
//# sourceMappingURL=BlazorPlusTheme.js.map