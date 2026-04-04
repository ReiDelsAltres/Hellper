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
    modules = [];
    cardStructs = [];
    offlineWarningPopup;
    constructor() {
        super();
        this.modules = ModuleManager.getAll();
    }
    async preInit() {
        // ensure we don't append duplicates if preInit runs multiple times
        this.cardStructs = [];
        this.modules = ModuleManager.getAll();
        for (const module of this.modules) {
            const struct = new ModuleCardStruct();
            struct.module = module;
            struct.class = new Observable(this.computeCardClass(module));
            struct.statusColor = new Observable(this.computeStatusColor(module));
            struct.chips = new Observable([]);
            const update = () => {
                struct.class.setObject(this.computeCardClass(module));
                struct.statusColor.setObject(this.computeStatusColor(module));
                const d = module.downloaded.getObject() === true;
                const a = module.isActive();
                const c = module.core;
                const transaction = struct.chips.transaction();
                transaction.updateObject(() => {
                    const chips = [];
                    if (d && !c)
                        chips.push({ color: 'success', size: 'small', text: 'Downloaded' });
                    if (a && !d)
                        chips.push({ color: 'secondary', size: 'small', text: 'Ephemeral' });
                    if (d && !a && !c)
                        chips.push({ color: 'empty', size: 'small', text: 'Disabled' });
                    if (!d && !a)
                        chips.push({ color: 'empty', size: 'small', text: 'Not downloaded' });
                    if (!!module.downloadError.getObject())
                        chips.push({ color: 'error', size: 'small', text: 'Error' });
                    return chips;
                });
                transaction.commit();
            };
            update();
            const moduleSize = () => {
                const val = module.totalSize.getObject() ?? 0;
                return module.downloaded.getObject() ? this.computeSizeText(val) : this.computeEstimatedSizeText(val);
            };
            struct.size = new Observable(moduleSize());
            module.totalSize.subscribe(() => struct.size.setObject(moduleSize()));
            module.downloaded.subscribe(() => struct.size.setObject(moduleSize()));
            module.enabled.subscribe(update);
            module.downloaded.subscribe(update);
            module.downloadError.subscribe(update);
            // Per-module download progress
            struct.progress = {
                active: new Observable(false),
                percent: new Observable(0),
                text: new Observable(''),
                file: new Observable(''),
                speed: new Observable(''),
            };
            // flag whether module itself is downloading (gives priority to module downloads)
            struct.ownActive = false;
            module.downloadProgress.subscribe((progress) => {
                struct.ownActive = progress.active;
                struct.progress.active.setObject(progress.active);
                if (progress.active) {
                    struct.progress.file.setObject(progress.currentFile);
                    const pct = progress.totalBytes > 0
                        ? Math.round((progress.downloadedBytes / progress.totalBytes) * 100)
                        : (progress.totalFiles > 0 ? Math.round((progress.completedFiles / progress.totalFiles) * 100) : 0);
                    struct.progress.percent.setObject(pct);
                    struct.progress.text.setObject(`${CacheManager.formatBytes(progress.downloadedBytes)} / ${CacheManager.formatBytes(progress.totalBytes)}`);
                    struct.progress.speed.setObject(progress.speed > 0 ? `${CacheManager.formatBytes(progress.speed)}/с` : '');
                }
                else {
                    struct.progress.percent.setObject(0);
                    struct.progress.text.setObject('');
                    struct.progress.file.setObject('');
                    struct.progress.speed.setObject('');
                }
            });
            // Sub-modules
            struct.subs = [];
            struct.subsTotal = new Observable('');
            const updateSubsTotal = () => {
                let total = 0;
                for (const s of module.getSubModules()) {
                    if (!s.inbuilt && s.downloaded.getObject()) {
                        total += (s.totalSize.getObject() ?? 0);
                    }
                }
                struct.subsTotal.setObject(total > 0 ? this.computeSizeText(total) : '');
            };
            for (const sub of module.getSubModules()) {
                const sStruct = {
                    sub,
                    class: new Observable(sub.inbuilt ? 'submodule-chip submodule-chip-inbuilt' : (sub.downloaded.getObject() ? 'submodule-chip submodule-chip-downloaded' : 'submodule-chip submodule-chip-not-downloaded'))
                };
                if (!sub.inbuilt) {
                    sub.downloaded.subscribe(() => {
                        sStruct.class.setObject(sub.downloaded.getObject() ? 'submodule-chip submodule-chip-downloaded' : 'submodule-chip submodule-chip-not-downloaded');
                    });
                    const subSizeText = () => {
                        const val = sub.totalSize.getObject() ?? 0;
                        return sub.downloaded.getObject() ? this.computeSizeText(val) : this.computeEstimatedSizeText(val);
                    };
                    sStruct.size = new Observable(subSizeText());
                    sub.totalSize.subscribe(() => {
                        sStruct.size.setObject(subSizeText());
                        updateSubsTotal();
                    });
                    sub.downloaded.subscribe(() => {
                        sStruct.size.setObject(subSizeText());
                        updateSubsTotal();
                    });
                    // also update total when sub list is first populated
                    updateSubsTotal();
                    sStruct.progress = {
                        active: new Observable(false),
                        percent: new Observable(0),
                        file: new Observable(''),
                        text: new Observable(''),
                        speed: new Observable('')
                    };
                    sub.downloadProgress.subscribe((progress) => {
                        sStruct.progress.active.setObject(progress.active);
                        if (progress.active) {
                            const pct = progress.totalBytes > 0
                                ? Math.round((progress.downloadedBytes / progress.totalBytes) * 100)
                                : (progress.totalFiles > 0 ? Math.round((progress.completedFiles / progress.totalFiles) * 100) : 0);
                            sStruct.progress.percent.setObject(pct);
                            sStruct.progress.file.setObject(progress.currentFile || '');
                            sStruct.progress.text.setObject(`${CacheManager.formatBytes(progress.downloadedBytes)} / ${CacheManager.formatBytes(progress.totalBytes)}`);
                            sStruct.progress.speed.setObject(progress.speed > 0 ? `${CacheManager.formatBytes(progress.speed)}/с` : '');
                            // reflect submodule progress on module card only when module itself isn't downloading
                            if (!struct.ownActive) {
                                struct.progress.active.setObject(true);
                                struct.progress.file.setObject(`${sub.name}${progress.currentFile ? ' — ' + progress.currentFile : ''}`);
                                struct.progress.percent.setObject(pct);
                                struct.progress.text.setObject(sStruct.progress.text.getObject());
                                struct.progress.speed.setObject(sStruct.progress.speed.getObject());
                            }
                        }
                        else {
                            sStruct.progress.percent.setObject(0);
                            sStruct.progress.file.setObject('');
                            sStruct.progress.text.setObject('');
                            sStruct.progress.speed.setObject('');
                            // when this sub finished, if no other subs or module downloading — clear module progress
                            const anyActive = struct.subs.some((x) => x.progress && x.progress.active.getObject());
                            if (!anyActive && !struct.ownActive) {
                                struct.progress.active.setObject(false);
                                struct.progress.percent.setObject(0);
                                struct.progress.text.setObject('');
                                struct.progress.file.setObject('');
                                struct.progress.speed.setObject('');
                            }
                            else if (!struct.ownActive && anyActive) {
                                // pick first active sub and reflect its progress
                                const activeSub = struct.subs.find((x) => x.progress && x.progress.active.getObject());
                                if (activeSub) {
                                    struct.progress.active.setObject(true);
                                    struct.progress.percent.setObject(activeSub.progress.percent.getObject());
                                    struct.progress.file.setObject(`${activeSub.sub.name}${activeSub.progress.file.getObject() ? ' — ' + activeSub.progress.file.getObject() : ''}`);
                                    struct.progress.text.setObject(activeSub.progress.text.getObject());
                                    struct.progress.speed.setObject(activeSub.progress.speed.getObject());
                                }
                            }
                        }
                    });
                }
                struct.subs.push(sStruct);
            }
            this.cardStructs.push(struct);
        }
    }
    async preLoad() {
        // reserved for async pre-load tasks if needed
    }
    async postLoad() {
        // reserved for post-load DOM bindings if needed
    }
    computeSizeText(bytes) {
        return bytes > 0 ? CacheManager.formatBytes(bytes) : '';
    }
    computeEstimatedSizeText(bytes) {
        return bytes > 0 ? `≈ ${CacheManager.formatBytes(bytes)}` : '';
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
class ModuleCardStruct {
    module;
    class;
    statusColor;
    chips;
    size;
    subsTotal;
    progress;
    subs;
    ownActive;
}
//# sourceMappingURL=SettingsPage.html.js.map