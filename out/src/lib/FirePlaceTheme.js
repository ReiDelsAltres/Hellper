import { defineAppTheme } from "./AppTheme.js";
let fireContainer = null;
let fireAnimationFrame = null;
let embers = [];
const EMBER_COLORS = [
    'rgba(212,81,30,', // deep ember
    'rgba(255,140,56,', // hot amber
    'rgba(255,190,79,', // yellow flame tip
    'rgba(184,58,26,', // smoldering cherry
];
function createFireContainer() {
    const container = document.createElement('div');
    container.id = 'fireplace-fire-overlay';
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
function createEmber(container) {
    const el = document.createElement('div');
    const radius = Math.random() * 3 + 1.5;
    const opacity = Math.random() * 0.7 + 0.3;
    const color = EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)];
    el.style.cssText = `
        position: absolute;
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        background: radial-gradient(circle, ${color}${opacity}) 0%, ${color}${opacity * 0.2}) 60%, transparent 100%);
        border-radius: 50%;
        pointer-events: none;
        box-shadow: 0 0 ${radius * 3}px ${color}${opacity * 0.4});
    `;
    container.appendChild(el);
    return {
        el,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 100,
        radius,
        speed: Math.random() * 1.8 + 0.6,
        drift: (Math.random() - 0.5) * 0.8,
        opacity,
        flicker: Math.random() * Math.PI * 2,
    };
}
function animateFire() {
    for (const ember of embers) {
        ember.y -= ember.speed;
        ember.x += ember.drift + Math.sin(ember.y * 0.02 + ember.flicker) * 0.5;
        // Fade out as they rise
        const progress = 1 - (ember.y / window.innerHeight);
        const currentOpacity = Math.max(0, ember.opacity * (1 - progress * 0.7));
        ember.el.style.opacity = String(currentOpacity);
        if (ember.y < -20 || currentOpacity < 0.02) {
            ember.y = window.innerHeight + 10 + Math.random() * 50;
            ember.x = Math.random() * window.innerWidth;
            ember.opacity = Math.random() * 0.7 + 0.3;
        }
        if (ember.x > window.innerWidth)
            ember.x = 0;
        if (ember.x < 0)
            ember.x = window.innerWidth;
        ember.el.style.transform = `translate(${ember.x}px, ${ember.y}px)`;
    }
    fireAnimationFrame = requestAnimationFrame(animateFire);
}
function startFire() {
    fireContainer = createFireContainer();
    embers = [];
    const count = Math.min(60, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < count; i++) {
        embers.push(createEmber(fireContainer));
    }
    animateFire();
}
function stopFire() {
    if (fireAnimationFrame !== null) {
        cancelAnimationFrame(fireAnimationFrame);
        fireAnimationFrame = null;
    }
    if (fireContainer) {
        fireContainer.remove();
        fireContainer = null;
    }
    embers = [];
}
const FirePlaceTheme = defineAppTheme({
    name: 'FirePlace',
    palette: 'FirePlace',
    onActivate: () => startFire(),
    onDeactivate: () => stopFire(),
});
export default FirePlaceTheme;
//# sourceMappingURL=FirePlaceTheme.js.map