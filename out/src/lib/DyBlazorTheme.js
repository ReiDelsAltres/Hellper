import { defineAppTheme } from "./AppTheme.js";
let glowContainer = null;
let glowAnimationFrame = null;
let orbs = [];
const ORB_COLORS = [
    { h: 248, s: 72, l: 58 }, // Blazor purple
    { h: 330, s: 100, l: 63 }, // Pink
    { h: 270, s: 80, l: 55 }, // Violet
    { h: 290, s: 60, l: 50 }, // Magenta
];
function createGlowContainer() {
    const container = document.createElement('div');
    container.id = 'dyblazor-glow-overlay';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
    `;
    document.body.appendChild(container);
    return container;
}
function createOrb(container) {
    const el = document.createElement('div');
    const radius = Math.random() * 120 + 60;
    const color = ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)];
    const opacity = Math.random() * 0.12 + 0.05;
    el.style.cssText = `
        position: absolute;
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        background: radial-gradient(circle,
            hsla(${color.h}, ${color.s}%, ${color.l}%, ${opacity}) 0%,
            hsla(${color.h}, ${color.s}%, ${color.l}%, ${opacity * 0.3}) 40%,
            transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        filter: blur(30px);
        mix-blend-mode: screen;
    `;
    container.appendChild(el);
    return {
        el,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        radius,
        hue: color.h,
        phase: Math.random() * Math.PI * 2,
    };
}
function animateGlow(time) {
    for (const orb of orbs) {
        orb.x += orb.vx + Math.sin(time * 0.0005 + orb.phase) * 0.2;
        orb.y += orb.vy + Math.cos(time * 0.0004 + orb.phase) * 0.15;
        // Bounce off edges
        if (orb.x < -orb.radius)
            orb.x = window.innerWidth + orb.radius;
        if (orb.x > window.innerWidth + orb.radius)
            orb.x = -orb.radius;
        if (orb.y < -orb.radius)
            orb.y = window.innerHeight + orb.radius;
        if (orb.y > window.innerHeight + orb.radius)
            orb.y = -orb.radius;
        // Subtle pulse
        const scale = 1 + Math.sin(time * 0.001 + orb.phase) * 0.08;
        orb.el.style.transform = `translate(${orb.x - orb.radius}px, ${orb.y - orb.radius}px) scale(${scale})`;
    }
    glowAnimationFrame = requestAnimationFrame(animateGlow);
}
function startGlow() {
    glowContainer = createGlowContainer();
    orbs = [];
    const count = Math.min(12, Math.max(5, Math.floor(window.innerWidth / 150)));
    for (let i = 0; i < count; i++) {
        orbs.push(createOrb(glowContainer));
    }
    glowAnimationFrame = requestAnimationFrame(animateGlow);
}
function stopGlow() {
    if (glowAnimationFrame !== null) {
        cancelAnimationFrame(glowAnimationFrame);
        glowAnimationFrame = null;
    }
    if (glowContainer) {
        glowContainer.remove();
        glowContainer = null;
    }
    orbs = [];
}
const DyBlazorTheme = defineAppTheme({
    name: 'DyBlazor',
    palette: 'Blazor',
    onActivate: () => startGlow(),
    onDeactivate: () => stopGlow(),
});
export default DyBlazorTheme;
//# sourceMappingURL=DyBlazorTheme.js.map