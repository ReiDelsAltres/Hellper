import { Router, HOSTING, Triplet, REGISTRY, ServiceWorker, Module, ModuleManager, resetToDefault } from "@Purper";

// ── Module: Core ──
// Core module uses static imports since it's always active
import "./src/components/ReTypography.html.js"
import "./src/components/ReInput.html.js"
import "./src/components/AppBar.html.js";
import "./src/components/AppLayout.html.js";
import "./src/components/ReButton.html.js";
import "./src/components/ReButtonGroup.html.js";
import "./src/components/ReChip.html.js";
import "./src/components/ReIcon.html.js";
import "./src/components/ReCheckbox.html.js";
import "./src/components/PopUp.html.js";
import "./src/components/ReTooltip.html.js";
import "./src/components/PaperComponent.html.js";
import "./src/components/ReTextArea.html.js";

import "./src/pages/MainPage.html.js";
import "./src/pages/ComponentShowcasePage.html.js"
import "./src/pages/TestingPage.html.js"
import "./src/pages/TestingSubPage.html.js"
import "./src/pages/TestingActualPage.html.js"
import "./src/pages/TestingAllPage.html.js";
import "./src/pages/SettingsPage.html.js";

import "./src/lib/WinterTheme.js";

const CoreModule = ModuleManager.register({
    name: "Core",
    description: "Базовые компоненты и страницы приложения",
    icon: "inventory_2",
    core: true,
    resources: [
        // ── Root files ──
        "./index.html",
        "./index.html.css",
        "./out/index.html.js",
        "./404.html",
        "./serviceworker.js",
        "./out/src/redirectRules.js",
        "./src/KatexUtils.js",

        // ── Library JS ──
        //"./out/src/lib/WinterTheme.js",
        "./out/src/lib/AppTheme.js",
        "./out/src/lib/SeededShuffle.js",
        "./out/src/frac/Testing.js",

        // ── Theme CSS (loaded by index.html <link> tags) ──
        "./resources/Blazor.theme.css",
        /*
        "./resources/Brass.theme.css",
        "./resources/BrassDark.theme.css",
        "./resources/Vine.theme.css",
        "./resources/Chess.theme.css",*/

        // ── Data ──
        "./resources/data/testing.json",
    ],
    subModules: [
        {
            name: "Purper",
            description: "Ресурсы самого фреймворка Purper",
            resources: [
                "./node_modules/@reidelsaltres/pureper/out/index.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/api/ElementHolder.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/api/EmptyConstructor.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/api/Lazy.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/api/Observer.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/component_api/mixin/Proto.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/component_api/UniHtml.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/component_api/Page.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/component_api/Component.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/component_api/Attribute.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/Triplet.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/TripletDecorator.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/Injection.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/Module.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/CacheManager.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/Fetcher.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/Hosting.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/Theme.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/engine/TemplateEngine.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/engine/Scope.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/engine/Expression.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/engine/StylePreprocessor.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/worker/Router.js",
                "./node_modules/@reidelsaltres/pureper/out/foundation/worker/ServiceWorker.js",
            ],
        },
        {
            name: "Component API",
            description: "Компоненты на основе системы компонентов Purper",
            resources: [
                "./out/src/components/core/ComponentCore.js",
                "./out/src/components/ReTypography.html.js",
                "./out/src/components/ReInput.html.js",
                "./out/src/components/AppBar.html.js",
                "./out/src/components/AppLayout.html.js",
                "./out/src/components/ReButton.html.js",
                "./out/src/components/ReButtonGroup.html.js",
                "./out/src/components/ReChip.html.js",
                "./out/src/components/ReIcon.html.js",
                "./out/src/components/ReCheckbox.html.js",
                "./out/src/components/PopUp.html.js",
                "./out/src/components/ReTooltip.html.js",
                "./out/src/components/PaperComponent.html.js",
                "./out/src/components/ReTextArea.html.js"
            ],
        },
        {
            name: "Pages",
            description: "Страницы приложения на основе системы компонентов Purper",
            resources: [
                "./out/src/pages/MainPage.html.js",
                "./out/src/pages/ComponentShowcasePage.html.js",
                "./out/src/pages/TestingPage.html.js",
                "./out/src/pages/TestingSubPage.html.js",
                "./out/src/pages/TestingActualPage.html.js",
                "./out/src/pages/TestingAllPage.html.js",
                "./out/src/pages/SettingsPage.html.js"
            ],
        },
        {
            name: "Иконки Material Symbols",
            description: "Страницы приложения на основе системы компонентов Purper",
            resources: [
                "./node_modules/material-symbols/index.css",
                "./node_modules/material-symbols/material-symbols-outlined.woff2",
                "./node_modules/material-symbols/material-symbols-rounded.woff2",
                "./node_modules/material-symbols/material-symbols-sharp.woff2",
            ],
        },
        {
            name: "Exam testing data",
            description: "Данные для тестирования по экзаменам",
            inbuilt: false,
            resources: [
                "./resources/data/testing.json",

                "./resources/data/s1/AzerDil.json",
                "./resources/data/s1/History.json",
                "./resources/data/s1/Inform.json",
                "./resources/data/s1/Math.json",

                "./resources/data/s2/DifferentialEquations.json",
                "./resources/data/s2/Eng.json",
                "./resources/data/s3/FunOfIT.json",
                "./resources/data/s3/LinearAlgebra.json",
                "./resources/data/s2/Physics.json",
                "./resources/data/s3/Programming.json",
                "./resources/data/s3/Vusala.json",

                "./resources/data/s3/ChainTheory.json",
                "./resources/data/s2/Eng.json",
                "./resources/data/s3/Math.json",
                "./resources/data/s3/MySQL.json",
                "./resources/data/s2/PCArch.json",
                "./resources/data/s3/Program.json",
                "./resources/data/s3/Vusala.json",
                "./resources/data/s3/Web.json",
                "./resources/data/s3/im/d1.png",

                "./resources/data/s4/KN.json"
            ],
        }
    ]
});
CoreModule.captureRegistrations(REGISTRY);

// ── Non-core modules use dynamic imports ──
async function registerNonCoreModules(): Promise<void> {
    // ── Module: Colloquium ──
    const ColloquiumModule = ModuleManager.register({
        name: "Colloquium",
        description: "Страницы коллоквиумов и открытые тесты по предметам",
        icon: "school",
        enabled: false,
        subModules: [
            {
                name: "Full data",
                description: "Полные данные коллоквиумов: вопросы и ответы по всем предметам",
                inbuilt: false,
                resources: [
                    "./resources/data/colloquim_testing.json",
                    "./resources/data/colloquium/s4/KA.json",
                    "./resources/data/colloquium/s4/KN.json",
                    "./resources/data/colloquium/s4/Eng.json",
                    "./resources/data/colloquium/s4/Web.json",
                    "./resources/data/colloquium/s4/OOP.json",
                    "./resources/data/colloquium/s4/Health.json",
                    "./resources/data/colloquium/s4/Math.json",
                ],
            }
        ]
    });

    await import("./src/pages/ColloquimTestingPage.html.js");
    await import("./src/pages/ColloquiumSubPage.html.js");
    await import("./src/pages/ColloquiumActualPage.html.js");

    ColloquiumModule.captureRegistrations(REGISTRY);

    // ── Module: Debug ──
    const DebugModule = ModuleManager.register({
        name: "Debug",
        description: "Инструменты отладки: статус сети и индикатор кеша",
        icon: "bug_report",
        enabled: false
    });

    await import("./src/components/NetworkStatus.html.js");
    await import("./src/components/CacheIndicator.html.js");

    DebugModule.captureRegistrations(REGISTRY);

    // ── Module: Advanced Design ──
    const AdvancedDesignModule = ModuleManager.register({
        name: "Advanced Design",
        description: "Предпросмотр цветовых палитр и расширенные инструменты дизайна",
        icon: "palette",
        enabled: false,
        subModules: [
            {
                name: "Palette set",
                description: "Набор цветовых палитр",
                inbuilt: false,
                resources: [
                    "./resources/Blazor.theme.css",
                    "./resources/Brass.theme.css",
                    "./resources/BrassDark.theme.css",
                    "./resources/Chess.theme.css",
                    "./resources/Vine.theme.css",
                    "./resources/Winter.theme.css"
                ],
            }
        ]
    });

    await import("./src/components/ColorPalettePreview.html.js");
    await import("./src/pages/PalettePage.html.js");

    AdvancedDesignModule.captureRegistrations(REGISTRY);

    AdvancedDesignModule.enabled.subscribe((enabled) => {
        if (!enabled) {
            resetToDefault();
        }
    });
}

export default class Index {
    public static async initialize(): Promise<void> {
        // Register non-core modules with dynamic imports first
        await registerNonCoreModules();

        const promises: Promise<void>[] = [
            ServiceWorker.register().then(() => { }),

            ...ModuleManager.initialize()
        ];

        await Promise.all(promises);
    }
}

const loc = window.location;
console.log(`[App] initialized at ${loc.href} (origin: ${loc.origin}, path: ${loc.pathname}${loc.search}${loc.hash})`);


Index.initialize().then(() => {
    let persistedRoute: URL | null = Router.getPersistedRoute();

    if (persistedRoute) {
        Router.clearPersistedRoute();
        Router.tryRouteTo(persistedRoute);
    }
    else {
        Router.tryRouteTo(new URL(HOSTING + "/", window.location.origin));
    }

    // Hide sidebar/topbar buttons for disabled modules
    function updateModuleButtons(): void {
        document.querySelectorAll<HTMLElement>('[data-module]').forEach(el => {
            const moduleName = el.getAttribute('data-module');
            if (moduleName) {
                el.style.display = ModuleManager.isActive(moduleName) ? '' : 'none';
            }
        });
    }

    // Subscribe to module state changes
    ModuleManager.getAll().forEach(mod => {
        mod.enabled.subscribe(() => updateModuleButtons());
    });

    updateModuleButtons();
}).catch(error => {
    console.error("Error during initialization:", error);
});