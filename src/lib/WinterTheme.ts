import { defineAppTheme } from "./AppTheme.js";

let snowContainer: HTMLDivElement | null = null;
let snowAnimationFrame: number | null = null;
let snowflakes: Snowflake[] = [];

interface Snowflake {
    el: HTMLDivElement;
    x: number;
    y: number;
    radius: number;
    speed: number;
    wind: number;
    opacity: number;
}

function createSnowContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'winter-snow-overlay';
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

function createSnowflake(container: HTMLDivElement): Snowflake {
    const el = document.createElement('div');
    const radius = Math.random() * 4 + 2;
    const opacity = Math.random() * 0.6 + 0.3;
    el.style.cssText = `
        position: absolute;
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        background: radial-gradient(circle, rgba(255,255,255,${opacity}) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
    `;
    container.appendChild(el);

    return {
        el,
        x: Math.random() * window.innerWidth,
        y: Math.random() * -window.innerHeight,
        radius,
        speed: Math.random() * 1.5 + 0.5,
        wind: Math.random() * 0.5 - 0.25,
        opacity,
    };
}

function animateSnow(): void {
    for (const flake of snowflakes) {
        flake.y += flake.speed;
        flake.x += flake.wind + Math.sin(flake.y * 0.01) * 0.3;

        if (flake.y > window.innerHeight) {
            flake.y = -10;
            flake.x = Math.random() * window.innerWidth;
        }
        if (flake.x > window.innerWidth) flake.x = 0;
        if (flake.x < 0) flake.x = window.innerWidth;

        flake.el.style.transform = `translate(${flake.x}px, ${flake.y}px)`;
    }
    snowAnimationFrame = requestAnimationFrame(animateSnow);
}

function startSnow(): void {
    snowContainer = createSnowContainer();
    snowflakes = [];
    const count = Math.min(80, Math.floor(window.innerWidth / 15));
    for (let i = 0; i < count; i++) {
        snowflakes.push(createSnowflake(snowContainer));
    }
    animateSnow();
}

function stopSnow(): void {
    if (snowAnimationFrame !== null) {
        cancelAnimationFrame(snowAnimationFrame);
        snowAnimationFrame = null;
    }
    if (snowContainer) {
        snowContainer.remove();
        snowContainer = null;
    }
    snowflakes = [];
}

const WinterTheme = defineAppTheme({
    name: 'Winter',
    palette: 'Winter',
    onActivate: () => startSnow(),
    onDeactivate: () => stopSnow(),
});

export default WinterTheme;
