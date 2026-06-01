import { defineAppTheme } from "./AppTheme.js";

let neonContainer: HTMLDivElement | null = null;
let neonAnimationFrame: number | null = null;
let particles: NeonParticle[] = [];

interface NeonParticle {
    el: HTMLDivElement;
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
    color: string;
    intensity: number;
}

const NEON_COLORS = [
    '#00ff88',  // neon cyan
    '#ff00ff',  // neon magenta
    '#00ccff',  // electric blue
    '#ff0088',  // hot pink
];

function createNeonContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'neon-theme-overlay';
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

function createNeonParticle(container: HTMLDivElement): NeonParticle {
    const el = document.createElement('div');
    const radius = Math.random() * 2 + 0.5;
    const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    const intensity = Math.random() * 0.5 + 0.5;

    el.style.cssText = `
        position: absolute;
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        box-shadow: 0 0 ${radius * 8}px ${color}, 0 0 ${radius * 16}px ${color}88;
        filter: blur(0.5px);
    `;
    container.appendChild(el);

    return {
        el,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        color,
        intensity,
    };
}

function animateNeon(): void {
    for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= window.innerWidth) {
            particle.vx *= -1;
            particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
        }
        if (particle.y <= 0 || particle.y >= window.innerHeight) {
            particle.vy *= -1;
            particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));
        }

        // Pulsing glow effect
        const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
        particle.el.style.opacity = String(particle.intensity * pulse);
        particle.el.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
    }
    neonAnimationFrame = requestAnimationFrame(animateNeon);
}

function startNeon(): void {
    neonContainer = createNeonContainer();
    particles = [];
    const count = Math.min(40, Math.floor(window.innerWidth / 30));
    for (let i = 0; i < count; i++) {
        particles.push(createNeonParticle(neonContainer));
    }
    animateNeon();
}

function stopNeon(): void {
    if (neonAnimationFrame !== null) {
        cancelAnimationFrame(neonAnimationFrame);
        neonAnimationFrame = null;
    }
    if (neonContainer) {
        neonContainer.remove();
        neonContainer = null;
    }
    particles = [];
}

const NeonTheme = defineAppTheme({
    name: 'Neon',
    palette: 'Neon',
    onActivate: () => startNeon(),
    onDeactivate: () => stopNeon(),
});

export default NeonTheme;
