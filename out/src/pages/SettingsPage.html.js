var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Page, RePage, ModuleManager, CacheManager, Observable } from "@Purper";
let SettingsPage = class SettingsPage extends Page {
    modules = ModuleManager.getAll();
    // Per-module reactive state
    moduleCardClasses = new Map();
    moduleStatusColors = new Map();
    // Per-module chip visibility (reactive)
    chipDownloadedVisible = new Map();
    chipEphemeralVisible = new Map();
    chipDisabledVisible = new Map();
    chipNotDownloadedVisible = new Map();
    chipErrorVisible = new Map();
    subModuleChipClasses = new Map();
    // Per-module download progress observables for the template
    moduleProgressPercents = new Map();
    moduleProgressTexts = new Map();
    moduleProgressFiles = new Map();
    moduleProgressSpeeds = new Map();
    moduleProgressActive = new Map();
    // Per-module size text
    moduleSizeTexts = new Map();
    // Per-sub-module progress and size
    subProgressActive = new Map();
    subProgressPercents = new Map();
    subSizeTexts = new Map();
    constructor() {
        super();
        for (const module of this.modules) {
            const cardClass = new Observable(this.computeCardClass(module));
            const statusColor = new Observable(this.computeStatusColor(module));
            this.moduleCardClasses.set(module.name, cardClass);
            this.moduleStatusColors.set(module.name, statusColor);
            const d = module.downloaded.getObject() === true;
            const a = module.isActive();
            const c = module.core;
            const chipDownloaded = new Observable(d && !c);
            const chipEphemeral = new Observable(a && !d);
            const chipDisabled = new Observable(d && !a && !c);
            const chipNotDownloaded = new Observable(!d && !a);
            this.chipDownloadedVisible.set(module.name, chipDownloaded);
            this.chipEphemeralVisible.set(module.name, chipEphemeral);
            this.chipDisabledVisible.set(module.name, chipDisabled);
            this.chipNotDownloadedVisible.set(module.name, chipNotDownloaded);
            const chipError = new Observable(!!module.downloadError.getObject());
            this.chipErrorVisible.set(module.name, chipError);
            // Module size text (reactive)
            const sizeText = new Observable(this.computeSizeText(module.totalSize.getObject() ?? 0));
            this.moduleSizeTexts.set(module.name, sizeText);
            module.totalSize.subscribe((val) => {
                sizeText.setObject(this.computeSizeText(val));
            });
            const update = () => {
                cardClass.setObject(this.computeCardClass(module));
                statusColor.setObject(this.computeStatusColor(module));
                const d = module.downloaded.getObject() === true;
                const a = module.isActive();
                const c = module.core;
                chipDownloaded.setObject(d && !c);
                chipEphemeral.setObject(a && !d);
                chipDisabled.setObject(d && !a && !c);
                chipNotDownloaded.setObject(!d && !a);
                chipError.setObject(!!module.downloadError.getObject());
            };
            module.enabled.subscribe(update);
            module.downloaded.subscribe(update);
            module.downloadError.subscribe((err) => {
                chipError.setObject(!!err);
            });
            // Per-module download progress
            const pPercent = new Observable(0);
            const pText = new Observable('');
            const pFile = new Observable('');
            const pSpeed = new Observable('');
            const pActive = new Observable(false);
            this.moduleProgressPercents.set(module.name, pPercent);
            this.moduleProgressTexts.set(module.name, pText);
            this.moduleProgressFiles.set(module.name, pFile);
            this.moduleProgressSpeeds.set(module.name, pSpeed);
            this.moduleProgressActive.set(module.name, pActive);
            module.downloadProgress.subscribe((progress) => {
                pActive.setObject(progress.active);
                if (progress.active) {
                    pFile.setObject(progress.currentFile);
                    const pct = progress.totalBytes > 0
                        ? Math.round((progress.downloadedBytes / progress.totalBytes) * 100)
                        : (progress.totalFiles > 0 ? Math.round((progress.completedFiles / progress.totalFiles) * 100) : 0);
                    pPercent.setObject(pct);
                    pText.setObject(`${CacheManager.formatBytes(progress.downloadedBytes)} / ${CacheManager.formatBytes(progress.totalBytes)}`);
                    pSpeed.setObject(progress.speed > 0 ? `${CacheManager.formatBytes(progress.speed)}/с` : '');
                }
                else {
                    pPercent.setObject(0);
                    pText.setObject('');
                    pFile.setObject('');
                    pSpeed.setObject('');
                }
            });
            // Sub-modules
            for (const sub of module.getSubModules()) {
                const chipClass = new Observable(sub.inbuilt ? 'submodule-chip submodule-chip-inbuilt' : (sub.downloaded.getObject() ? 'submodule-chip submodule-chip-downloaded' : 'submodule-chip submodule-chip-not-downloaded'));
                if (!sub.inbuilt) {
                    sub.downloaded.subscribe(() => {
                        chipClass.setObject(sub.downloaded.getObject() ? 'submodule-chip submodule-chip-downloaded' : 'submodule-chip submodule-chip-not-downloaded');
                    });
                }
                this.subModuleChipClasses.set(sub, chipClass);
                // Sub-module size
                if (!sub.inbuilt) {
                    const subSize = new Observable(this.computeSizeText(sub.totalSize.getObject() ?? 0));
                    sub.totalSize.subscribe((val) => {
                        subSize.setObject(this.computeSizeText(val));
                    });
                    this.subSizeTexts.set(sub, subSize);
                }
                // Sub-module progress
                if (!sub.inbuilt) {
                    const subActive = new Observable(false);
                    const subPercent = new Observable(0);
                    this.subProgressActive.set(sub, subActive);
                    this.subProgressPercents.set(sub, subPercent);
                    sub.downloadProgress.subscribe((progress) => {
                        subActive.setObject(progress.active);
                        if (progress.active) {
                            const pct = progress.totalBytes > 0
                                ? Math.round((progress.downloadedBytes / progress.totalBytes) * 100)
                                : (progress.totalFiles > 0 ? Math.round((progress.completedFiles / progress.totalFiles) * 100) : 0);
                            subPercent.setObject(pct);
                        }
                        else {
                            subPercent.setObject(0);
                        }
                    });
                }
            }
        }
    }
    computeSizeText(bytes) {
        return bytes > 0 ? CacheManager.formatBytes(bytes) : '';
    }
    getModuleCardClass(module) {
        return this.moduleCardClasses.get(module.name);
    }
    getModuleStatusColor(module) {
        return this.moduleStatusColors.get(module.name);
    }
    getSubModuleChipClass(sub) {
        return this.subModuleChipClasses.get(sub);
    }
    getModuleSizeText(module) {
        return this.moduleSizeTexts.get(module.name);
    }
    getModuleProgressActive(module) {
        return this.moduleProgressActive.get(module.name);
    }
    getModuleProgressPercent(module) {
        return this.moduleProgressPercents.get(module.name);
    }
    getModuleProgressText(module) {
        return this.moduleProgressTexts.get(module.name);
    }
    getModuleProgressFile(module) {
        return this.moduleProgressFiles.get(module.name);
    }
    getModuleProgressSpeed(module) {
        return this.moduleProgressSpeeds.get(module.name);
    }
    getSubSizeText(sub) {
        return this.subSizeTexts.get(sub);
    }
    getSubProgressActive(sub) {
        return this.subProgressActive.get(sub);
    }
    getSubProgressPercent(sub) {
        return this.subProgressPercents.get(sub);
    }
    isChipDownloadedVisible(module) {
        return this.chipDownloadedVisible.get(module.name);
    }
    isChipEphemeralVisible(module) {
        return this.chipEphemeralVisible.get(module.name);
    }
    isChipDisabledVisible(module) {
        return this.chipDisabledVisible.get(module.name);
    }
    isChipNotDownloadedVisible(module) {
        return this.chipNotDownloadedVisible.get(module.name);
    }
    isChipErrorVisible(module) {
        return this.chipErrorVisible.get(module.name);
    }
    computeCardClass(module) {
        if (module.downloadError.getObject())
            return 'module-card module-error';
        if (module.core) {
            return module.downloaded.getObject() ? 'module-card module-core' : 'module-card module-core module-ephemeral';
        }
        if (module.ephemeral)
            return 'module-card module-ephemeral';
        if (!module.downloaded.getObject())
            return 'module-card module-not-downloaded';
        return 'module-card';
    }
    computeStatusColor(module) {
        if (module.downloadError.getObject())
            return 'error';
        if (module.core) {
            return module.downloaded.getObject() ? 'info' : 'tertiary';
        }
        if (module.ephemeral)
            return 'tertiary';
        if (module.downloaded.getObject())
            return 'success';
        return 'empty';
    }
    async onModuleToggle(module) {
        if (module.core)
            return;
        if (module.isActive()) {
            module.disable();
        }
        else {
            await module.enable();
            if (!module.downloaded.getObject() && !navigator.onLine) {
                this.offlineWarningPopup?.open();
            }
        }
        ModuleManager.persistState();
    }
    async onModuleDownload(module) {
        await module.download();
        ModuleManager.persistState();
    }
    async onModuleRemove(module) {
        await module.undownload();
        if (!module.core && module.isActive()) {
            module.disable();
        }
        ModuleManager.persistState();
    }
    async onSubModuleDownload(sub) {
        await sub.download();
        ModuleManager.persistState();
    }
    async onSubModuleRemove(sub) {
        await sub.undownload();
        ModuleManager.persistState();
    }
    offlineWarningPopup;
    closeOfflineWarning() {
        this.offlineWarningPopup?.close();
    }
};
SettingsPage = __decorate([
    RePage({
        markupURL: "./src/pages/SettingsPage.hmle",
        cssURL: "./src/pages/SettingsPage.html.css",
    }, "/settings"),
    __metadata("design:paramtypes", [])
], SettingsPage);
export default SettingsPage;
//# sourceMappingURL=SettingsPage.html.js.map