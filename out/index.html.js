import { Router, HOSTING, REGISTRY, ServiceWorker, ModuleManager, resetToDefault, activateAppTheme } from "@Purper";
// ── Module: Core ──
// Core module uses static imports since it's always active
import "./src/components/ReTypography.html.js";
import "./src/components/ReInput.html.js";
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
import "./src/components/ReRangeSlider.html.js";
import "./src/components/QuestionComponent.html.js";
import "./src/pages/MainPage.html.js";
import "./src/pages/TestingPage.html.js";
import "./src/pages/TestingSubPage.html.js";
import "./src/pages/TestingActualPage.html.js";
import "./src/pages/TestingAllPage.html.js";
import "./src/pages/GeneratorsPage.html.js";
import "./src/pages/SettingsPage.html.js";
const CoreModule = ModuleManager.register({
    name: "Core",
    description: "Базовые компоненты и страницы приложения",
    icon: "inventory_2",
    estimatedSize: 13_200_000,
    core: true,
    resources: [
        // ── Root files ──
        "./index.html",
        "./index.html.css",
        "./out/index.html.js",
        "./404.html",
        "./resources/oyu_university.png",
        "./serviceworker.js",
        "./out/src/redirectRules.js",
        "./src/KatexUtils.js",
        "./out/src/KatexUtils.js",
        // ── Library JS ──
        "./out/src/lib/AppTheme.js",
        "./out/src/lib/SeededShuffle.js",
        "./out/src/lib/PresetStore.js",
        "./out/src/lib/LanguageUtility.js",
        "./out/src/lib/SemanticString.js",
        "./out/src/frac/Testing.js",
        // ── Theme CSS (default theme, loaded by index.html <link>) ──
        "./resources/Blazor.theme.css",
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
                "./out/src/components/ReTextArea.html.js",
                "./out/src/components/ReRangeSlider.html.js",
                "./out/src/components/QuestionComponent.html.js",
                "./src/components/QuestionComponent.hmle",
                "./src/components/QuestionComponent.html.css"
            ],
        },
        {
            name: "Pages",
            description: "Страницы приложения на основе системы компонентов Purper",
            resources: [
                "./out/src/pages/MainPage.html.js",
                "./out/src/pages/TestingPage.html.js",
                "./out/src/pages/TestingSubPage.html.js",
                "./out/src/pages/TestingActualPage.html.js",
                "./out/src/pages/TestingAllPage.html.js",
                "./out/src/pages/GeneratorsPage.html.js",
                "./out/src/pages/SettingsPage.html.js"
            ],
        },
        {
            name: "Иконки Material Symbols",
            description: "Иконки Material Symbols для интерфейса",
            resources: [
                "./node_modules/material-symbols/index.css",
                "./node_modules/material-symbols/material-symbols-outlined.woff2",
                "./node_modules/material-symbols/material-symbols-rounded.woff2",
                "./node_modules/material-symbols/material-symbols-sharp.woff2",
            ],
        },
        {
            name: "KaTeX",
            description: "Библиотека рендеринга математических формул",
            resources: [
                "./node_modules/katex/dist/katex.min.css",
                "./node_modules/katex/dist/katex.min.js",
                "./node_modules/katex/dist/contrib/auto-render.min.js",
                "./node_modules/katex/dist/fonts/KaTeX_AMS-Regular.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Caligraphic-Bold.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Caligraphic-Regular.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Fraktur-Bold.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Fraktur-Regular.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Main-Bold.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Main-BoldItalic.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Main-Italic.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Main-Regular.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Math-BoldItalic.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Math-Italic.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_SansSerif-Bold.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_SansSerif-Italic.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_SansSerif-Regular.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Script-Regular.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Size1-Regular.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Size2-Regular.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Size3-Regular.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Size4-Regular.woff2",
                "./node_modules/katex/dist/fonts/KaTeX_Typewriter-Regular.woff2",
            ],
        },
        {
            name: "Exam testing data",
            description: "Данные для тестирования по экзаменам",
            inbuilt: false,
            estimatedSize: 2_300_000,
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
async function registerNonCoreModules() {
    // ── Module: Colloquium ──
    const ColloquiumModule = ModuleManager.register({
        name: "Colloquium",
        description: "Страницы коллоквиумов и открытые тесты по предметам",
        icon: "school",
        enabled: false,
        estimatedSize: 1_500_000,
        resources: [
            "./out/src/pages/ColloquimTestingPage.html.js",
            "./out/src/pages/ColloquiumSubPage.html.js",
            "./out/src/pages/ColloquiumActualPage.html.js",
            "./out/src/lib/SimilarityScorer.js",
            // Template and style source files (fetched at runtime by the engine)
            "./src/pages/ColloquimTestingPage.hmle",
            "./src/pages/ColloquimTestingPage.html.css",
            "./src/pages/ColloquiumSubPage.hmle",
            "./src/pages/ColloquiumSubPage.html.css",
            "./src/pages/ColloquiumActualPage.hmle",
            "./src/pages/ColloquiumActualPage.html.css",
        ],
        subModules: [
            {
                name: "Full data",
                description: "Полные данные коллоквиумов: вопросы и ответы по всем предметам",
                inbuilt: false,
                estimatedSize: 492_000,
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
            },
            {
                name: "HuggingFace",
                description: "Библиотека HuggingFace Transformers и ONNX Runtime",
                inbuilt: true,
                estimatedSize: 3_600_000,
                async onDownload(progress) {
                    const urls = [
                        "./node_modules/@huggingface/transformers/dist/transformers.web.js",
                        "./node_modules/onnxruntime-web/dist/ort.bundle.min.mjs",
                        "./node_modules/onnxruntime-common/dist/esm/index.js",
                    ];
                    const cache = await caches.open("transformers-cache");
                    let downloadedBytes = 0;
                    for (let i = 0; i < urls.length; i++) {
                        const absUrl = new URL(urls[i], location.href).href;
                        const response = await fetch(absUrl);
                        const buffer = await response.arrayBuffer();
                        downloadedBytes += buffer.byteLength;
                        await cache.put(absUrl, new Response(buffer, {
                            status: response.status,
                            headers: response.headers,
                        }));
                        progress.setObject({
                            totalFiles: urls.length, completedFiles: i + 1,
                            currentFile: urls[i],
                            totalBytes: Math.max(3_600_000, downloadedBytes),
                            downloadedBytes, speed: 0, active: true,
                        });
                    }
                },
                async onUndownload() {
                    if ('caches' in window) {
                        const modelCache = await caches.open("transformers-cache");
                        const modelKeys = await modelCache.keys();
                        await Promise.all(modelKeys.filter(req => req.url.includes("transformers.web.js") ||
                            req.url.includes("ort.bundle.min.mjs") ||
                            req.url.includes("onnxruntime-web") ||
                            (req.url.includes("onnxruntime-common") && req.url.includes("index.js"))).map(req => modelCache.delete(req)));
                    }
                },
            },
            {
                name: "Embedding",
                description: "Модель Xenova/all-MiniLM-L6-v2 для семантического анализа",
                inbuilt: false,
                estimatedSize: 160_000_000,
                async onDownload(progress) {
                    const { pipeline, env } = await import("@huggingface/transformers");
                    env.useBrowserCache = true;
                    env.useCustomCache = false;
                    env.customCache = null;
                    env.allowRemoteModels = true;
                    const fileLoaded = new Map();
                    const fileTotals = new Map();
                    const estimatedTotal = 160_000_000;
                    try {
                        await pipeline("feature-extraction", "Xenova/multilingual-e5-small", {
                            dtype: "q8",
                            progress_callback: (info) => {
                                if (info.status === "initiate") {
                                    fileLoaded.set(info.file, 0);
                                }
                                else if (info.status === "progress") {
                                    fileLoaded.set(info.file, info.loaded ?? 0);
                                    if (info.total)
                                        fileTotals.set(info.file, info.total);
                                    const downloadedBytes = Array.from(fileLoaded.values()).reduce((a, b) => a + b, 0);
                                    const knownTotal = Array.from(fileTotals.values()).reduce((a, b) => a + b, 0);
                                    progress.setObject({
                                        totalFiles: fileLoaded.size, completedFiles: 0,
                                        currentFile: info.file ?? "Embedding",
                                        totalBytes: Math.max(estimatedTotal, knownTotal),
                                        downloadedBytes, speed: 0, active: true,
                                    });
                                }
                            },
                        });
                    }
                    catch (e) {
                    }
                },
                async onUndownload() {
                    if ('caches' in window) {
                        const modelCache = await caches.open("transformers-cache");
                        const modelKeys = await modelCache.keys();
                        await Promise.all(modelKeys
                            .filter(req => req.url.includes("multilingual-e5-small"))
                            .map(req => modelCache.delete(req)));
                    }
                },
            },
            /*{
                name: "NLI",
                description: "Модель mDeBERTa-v3-base (multilingual XNLI) для NLI анализа",
                inbuilt: false,
                estimatedSize: 140_000_000,
                async onDownload(progress) {
                    const { pipeline, env } = await import("@huggingface/transformers");

                    env.useBrowserCache = true;
                    env.useCustomCache = false;
                    env.customCache = null;
                    env.allowRemoteModels = true;

                    const fileLoaded = new Map<string, number>();
                    const fileTotals = new Map<string, number>();
                    const estimatedTotal = 140_000_000;
                    try {
                        await pipeline("token-classification", "Xenova/bert-base-multilingual-cased-ner-hrl", {
                            dtype: "q4",
                            progress_callback: (info: any) => {
                                if (info.status === "initiate") {
                                    fileLoaded.set(info.file, 0);
                                } else if (info.status === "progress") {
                                    fileLoaded.set(info.file, info.loaded ?? 0);
                                    if (info.total) fileTotals.set(info.file, info.total);
                                    const downloadedBytes = Array.from(fileLoaded.values()).reduce((a, b) => a + b, 0);
                                    const knownTotal = Array.from(fileTotals.values()).reduce((a, b) => a + b, 0);
                                    progress.setObject({
                                        totalFiles: fileLoaded.size, completedFiles: 0,
                                        currentFile: info.file ?? "NLI",
                                        totalBytes: Math.max(estimatedTotal, knownTotal),
                                        downloadedBytes, speed: 0, active: true,
                                    });
                                }
                            },
                        } as any);
                    } catch (e) {
                    }
                },
                async onUndownload() {
                    if ('caches' in window) {
                        const modelCache = await caches.open("transformers-cache");
                        const modelKeys = await modelCache.keys();
                        await Promise.all(
                            modelKeys
                                .filter(req => req.url.includes("bert-base-multilingual-cased-ner-hrl"))
                                .map(req => modelCache.delete(req))
                        );
                    }
                },
            },*/
        ]
    });
    ColloquiumModule.addRegistration(async () => {
        await import("./src/pages/ColloquimTestingPage.html.js");
        await import("./src/pages/ColloquiumSubPage.html.js");
        await import("./src/pages/ColloquiumActualPage.html.js");
        for (const reg of REGISTRY.splice(0))
            await reg();
    });
    // ── Module: Debug ──
    const DebugModule = ModuleManager.register({
        name: "Debug",
        description: "Инструменты отладки: статус сети и индикатор кеша",
        icon: "bug_report",
        estimatedSize: 10_400,
        enabled: false,
        resources: [
            "./out/src/components/NetworkStatus.html.js",
            "./out/src/components/CacheIndicator.html.js",
            "./src/components/NetworkStatus.hmle",
            "./out/src/components/NetworkStatus.html.css",
            "./src/components/CacheIndicator.hmle",
            "./out/src/components/CacheIndicator.html.css",
            "./out/src/pages/ComponentShowcasePage.html.js",
            "./src/pages/ComponentShowcasePage.hmle",
            "./src/pages/ComponentShowcasePage.html.css",
        ],
    });
    DebugModule.addRegistration(async () => {
        await import("./src/components/CacheIndicator.html.js");
        await import("./src/pages/ComponentShowcasePage.html.js");
        for (const reg of REGISTRY.splice(0))
            await reg();
    });
    // ── Module: Advanced Design ──
    const AdvancedDesignModule = ModuleManager.register({
        name: "Advanced Design",
        description: "Предпросмотр цветовых палитр и расширенные инструменты дизайна",
        icon: "palette",
        estimatedSize: 80_000,
        enabled: false,
        resources: [
            "./out/src/components/ColorPalettePreview.html.js",
            "./out/src/pages/PalettePage.html.js",
            "./src/components/ColorPalettePreview.html",
            "./src/components/ColorPalettePreview.html.css",
            "./src/pages/PalettePage.html",
            "./src/pages/PalettePage.html.css",
        ],
        subModules: [
            {
                name: "Palette set",
                description: "Набор цветовых палитр",
                inbuilt: false,
                estimatedSize: 240_800,
                resources: [
                    "./resources/Blazor.theme.css",
                    "./resources/FirePlace.theme.css",
                    "./resources/Brass.theme.css",
                    "./resources/BrassDark.theme.css",
                    "./resources/Chess.theme.css",
                    "./resources/Vine.theme.css",
                    "./resources/Winter.theme.css",
                    "./out/src/lib/WinterTheme.js",
                    "./out/src/lib/FirePlaceTheme.js",
                    "./out/src/lib/NeonTheme.js"
                ],
            }
        ]
    });
    AdvancedDesignModule.addRegistration(async () => {
        await import("./src/lib/WinterTheme.js");
        await import("./src/lib/FirePlaceTheme.js");
        await import("./src/lib/NeonTheme.js");
        await import("./src/components/ColorPalettePreview.html.js");
        await import("./src/pages/PalettePage.html.js");
        for (const reg of REGISTRY.splice(0))
            await reg();
    });
    AdvancedDesignModule.enabled.subscribe((enabled) => {
        if (!enabled) {
            resetToDefault();
        }
    });
}
export default class Index {
    static async initialize() {
        // Point the manager at the fresh, network-fetched version manifest so
        // auto-update can detect new builds even though the bootstrap code
        // (index.html.js) is served from cache. This file is generated at build
        // time and must NOT be listed among any module's cached resources.
        ModuleManager.configure({ versionManifestUrl: "./module-versions.json" });
        // Register non-core modules with dynamic imports first
        await registerNonCoreModules();
        const promises = [
            ServiceWorker.register().then(() => { }),
            ...ModuleManager.initialize()
        ];
        await Promise.all(promises);
    }
}
const loc = window.location;
console.log(`[App] initialized at ${loc.href} (origin: ${loc.origin}, path: ${loc.pathname}${loc.search}${loc.hash})`);
Index.initialize().then(async () => {
    const updatePending = sessionStorage.getItem('purper:updatePending') === 'true';
    if (updatePending) {
        sessionStorage.removeItem('purper:updatePending');
        if (await ServiceWorker.isOnline()) {
            console.log('[App]: Update detected — reinstalling installed modules');
            await ModuleManager.refreshDownloadedModules();
        }
        else {
            console.log('[App]: Update detected but offline — skipping module refresh');
        }
    }
    // Restore saved AppTheme (modules are now registered)
    const savedAppTheme = localStorage.getItem('appTheme');
    if (savedAppTheme) {
        try {
            await activateAppTheme(savedAppTheme);
        }
        catch (e) {
            console.warn('[App] Failed to restore AppTheme:', savedAppTheme, e);
        }
    }
    let persistedRoute = Router.getPersistedRoute();
    if (persistedRoute) {
        Router.clearPersistedRoute();
        Router.tryRouteTo(persistedRoute);
    }
    else {
        Router.tryRouteTo(new URL(HOSTING + "/", window.location.origin));
    }
    // Hide sidebar/topbar buttons for disabled modules
    function updateModuleButtons() {
        document.querySelectorAll('[data-module]').forEach(el => {
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
    // Expose modules globally for console and templates
    (function exposeModulesGlobally() {
        const w = window;
        w.modules = w.modules || {};
        for (const m of ModuleManager.getAll()) {
            try {
                w.modules[m.name] = m;
                const safe = (m.name ?? '').replace(/[^A-Za-z0-9_$]/g, '_');
                const varName = (/^[0-9]/.test(safe) ? '_' : '') + safe;
                if (varName)
                    w[varName] = m;
            }
            catch (e) {
                console.warn('[Index]: Failed to expose module', m, e);
            }
        }
    })();
}).catch(error => {
    console.error("Error during initialization:", error);
});
//# sourceMappingURL=index.html.js.map