import { Page, RePage, Module, ModuleManager, DownloadProgress, CacheManager, Observable, SubModule } from "@Purper";

@RePage({
    markupURL: "./src/pages/SettingsPage.hmle",
    cssURL: "./src/pages/SettingsPage.html.css",
}, "/settings")
export default class SettingsPage extends Page {
    public modules: Module[] = ModuleManager.getAll();

    // Per-module reactive state
    private moduleCardClasses: Map<string, Observable<string>> = new Map();
    private moduleStatusColors: Map<string, Observable<string>> = new Map();

    // Per-module chip visibility (reactive)
    private chipDownloadedVisible: Map<string, Observable<boolean>> = new Map();
    private chipEphemeralVisible: Map<string, Observable<boolean>> = new Map();
    private chipDisabledVisible: Map<string, Observable<boolean>> = new Map();
    private chipNotDownloadedVisible: Map<string, Observable<boolean>> = new Map();
    private chipErrorVisible: Map<string, Observable<boolean>> = new Map();
    private subModuleChipClasses: Map<SubModule, Observable<string>> = new Map();

    // Per-module download progress observables for the template
    private moduleProgressPercents: Map<string, Observable<number>> = new Map();
    private moduleProgressTexts: Map<string, Observable<string>> = new Map();
    private moduleProgressFiles: Map<string, Observable<string>> = new Map();
    private moduleProgressSpeeds: Map<string, Observable<string>> = new Map();
    private moduleProgressActive: Map<string, Observable<boolean>> = new Map();

    // Per-module size text
    private moduleSizeTexts: Map<string, Observable<string>> = new Map();

    // Per-sub-module progress and size
    private subProgressActive: Map<SubModule, Observable<boolean>> = new Map();
    private subProgressPercents: Map<SubModule, Observable<number>> = new Map();
    private subSizeTexts: Map<SubModule, Observable<string>> = new Map();

    constructor() {
        super();
        for (const module of this.modules) {
            const cardClass = new Observable<string>(this.computeCardClass(module));
            const statusColor = new Observable<string>(this.computeStatusColor(module));

            this.moduleCardClasses.set(module.name, cardClass);
            this.moduleStatusColors.set(module.name, statusColor);

            const d = module.downloaded.getObject() === true;
            const a = module.isActive();
            const c = module.core;

            const chipDownloaded = new Observable<boolean>(d && !c);
            const chipEphemeral = new Observable<boolean>(a && !d);
            const chipDisabled = new Observable<boolean>(d && !a && !c);
            const chipNotDownloaded = new Observable<boolean>(!d && !a);

            this.chipDownloadedVisible.set(module.name, chipDownloaded);
            this.chipEphemeralVisible.set(module.name, chipEphemeral);
            this.chipDisabledVisible.set(module.name, chipDisabled);
            this.chipNotDownloadedVisible.set(module.name, chipNotDownloaded);

            const chipError = new Observable<boolean>(!!module.downloadError.getObject());
            this.chipErrorVisible.set(module.name, chipError);

            // Module size text (reactive)
            const sizeText = new Observable<string>(this.computeSizeText(module.totalSize.getObject() ?? 0));
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
            const pPercent = new Observable<number>(0);
            const pText = new Observable<string>('');
            const pFile = new Observable<string>('');
            const pSpeed = new Observable<string>('');
            const pActive = new Observable<boolean>(false);
            this.moduleProgressPercents.set(module.name, pPercent);
            this.moduleProgressTexts.set(module.name, pText);
            this.moduleProgressFiles.set(module.name, pFile);
            this.moduleProgressSpeeds.set(module.name, pSpeed);
            this.moduleProgressActive.set(module.name, pActive);

            module.downloadProgress.subscribe((progress: DownloadProgress) => {
                pActive.setObject(progress.active);
                if (progress.active) {
                    pFile.setObject(progress.currentFile);
                    const pct = progress.totalBytes > 0
                        ? Math.round((progress.downloadedBytes / progress.totalBytes) * 100)
                        : (progress.totalFiles > 0 ? Math.round((progress.completedFiles / progress.totalFiles) * 100) : 0);
                    pPercent.setObject(pct);
                    pText.setObject(
                        `${CacheManager.formatBytes(progress.downloadedBytes)} / ${CacheManager.formatBytes(progress.totalBytes)}`
                    );
                    pSpeed.setObject(
                        progress.speed > 0 ? `${CacheManager.formatBytes(progress.speed)}/с` : ''
                    );
                } else {
                    pPercent.setObject(0);
                    pText.setObject('');
                    pFile.setObject('');
                    pSpeed.setObject('');
                }
            });

            // Sub-modules
            for (const sub of module.getSubModules()) {
                const chipClass = new Observable<string>(
                    sub.inbuilt ? 'submodule-chip submodule-chip-inbuilt' : (sub.downloaded.getObject() ? 'submodule-chip submodule-chip-downloaded' : 'submodule-chip submodule-chip-not-downloaded')
                );
                if (!sub.inbuilt) {
                    sub.downloaded.subscribe(() => {
                        chipClass.setObject(
                            sub.downloaded.getObject() ? 'submodule-chip submodule-chip-downloaded' : 'submodule-chip submodule-chip-not-downloaded'
                        );
                    });
                }
                this.subModuleChipClasses.set(sub, chipClass);

                // Sub-module size
                if (!sub.inbuilt) {
                    const subSize = new Observable<string>(this.computeSizeText(sub.totalSize.getObject() ?? 0));
                    sub.totalSize.subscribe((val) => {
                        subSize.setObject(this.computeSizeText(val));
                    });
                    this.subSizeTexts.set(sub, subSize);
                }

                // Sub-module progress
                if (!sub.inbuilt) {
                    const subActive = new Observable<boolean>(false);
                    const subPercent = new Observable<number>(0);
                    this.subProgressActive.set(sub, subActive);
                    this.subProgressPercents.set(sub, subPercent);

                    sub.downloadProgress.subscribe((progress: DownloadProgress) => {
                        subActive.setObject(progress.active);
                        if (progress.active) {
                            const pct = progress.totalBytes > 0
                                ? Math.round((progress.downloadedBytes / progress.totalBytes) * 100)
                                : (progress.totalFiles > 0 ? Math.round((progress.completedFiles / progress.totalFiles) * 100) : 0);
                            subPercent.setObject(pct);
                        } else {
                            subPercent.setObject(0);
                        }
                    });
                }
            }
        }
    }

    private computeSizeText(bytes: number): string {
        return bytes > 0 ? CacheManager.formatBytes(bytes) : '';
    }

    public getModuleCardClass(module: Module): Observable<string> {
        return this.moduleCardClasses.get(module.name)!;
    }

    public getModuleStatusColor(module: Module): Observable<string> {
        return this.moduleStatusColors.get(module.name)!;
    }

    public getSubModuleChipClass(sub: SubModule): Observable<string> {
        return this.subModuleChipClasses.get(sub)!;
    }

    public getModuleSizeText(module: Module): Observable<string> {
        return this.moduleSizeTexts.get(module.name)!;
    }

    public getModuleProgressActive(module: Module): Observable<boolean> {
        return this.moduleProgressActive.get(module.name)!;
    }

    public getModuleProgressPercent(module: Module): Observable<number> {
        return this.moduleProgressPercents.get(module.name)!;
    }

    public getModuleProgressText(module: Module): Observable<string> {
        return this.moduleProgressTexts.get(module.name)!;
    }

    public getModuleProgressFile(module: Module): Observable<string> {
        return this.moduleProgressFiles.get(module.name)!;
    }

    public getModuleProgressSpeed(module: Module): Observable<string> {
        return this.moduleProgressSpeeds.get(module.name)!;
    }

    public getSubSizeText(sub: SubModule): Observable<string> {
        return this.subSizeTexts.get(sub)!;
    }

    public getSubProgressActive(sub: SubModule): Observable<boolean> {
        return this.subProgressActive.get(sub)!;
    }

    public getSubProgressPercent(sub: SubModule): Observable<number> {
        return this.subProgressPercents.get(sub)!;
    }

    public isChipDownloadedVisible(module: Module): Observable<boolean> {
        return this.chipDownloadedVisible.get(module.name)!;
    }

    public isChipEphemeralVisible(module: Module): Observable<boolean> {
        return this.chipEphemeralVisible.get(module.name)!;
    }

    public isChipDisabledVisible(module: Module): Observable<boolean> {
        return this.chipDisabledVisible.get(module.name)!;
    }

    public isChipNotDownloadedVisible(module: Module): Observable<boolean> {
        return this.chipNotDownloadedVisible.get(module.name)!;
    }

    public isChipErrorVisible(module: Module): Observable<boolean> {
        return this.chipErrorVisible.get(module.name)!;
    }

    private computeCardClass(module: Module): string {
        if (module.downloadError.getObject()) return 'module-card module-error';
        if (module.core) {
            return module.downloaded.getObject() ? 'module-card module-core' : 'module-card module-core module-ephemeral';
        }
        if (module.ephemeral) return 'module-card module-ephemeral';
        if (!module.downloaded.getObject()) return 'module-card module-not-downloaded';
        return 'module-card';
    }

    private computeStatusColor(module: Module): string {
        if (module.downloadError.getObject()) return 'error';
        if (module.core) {
            return module.downloaded.getObject() ? 'info' : 'tertiary';
        }
        if (module.ephemeral) return 'tertiary';
        if (module.downloaded.getObject()) return 'success';
        return 'empty';
    }

    public async onModuleToggle(module: Module): Promise<void> {
        if (module.core) return;
        if (module.isActive()) {
            module.disable();
        } else {
            await module.enable();
            if (!module.downloaded.getObject() && !navigator.onLine) {
                this.offlineWarningPopup?.open();
            }
        }
        ModuleManager.persistState();
    }

    public async onModuleDownload(module: Module): Promise<void> {
        await module.download();
        ModuleManager.persistState();
    }

    public async onModuleRemove(module: Module): Promise<void> {
        await module.undownload();
        if (!module.core && module.isActive()) {
            module.disable();
        }
        ModuleManager.persistState();
    }

    public async onSubModuleDownload(sub: SubModule): Promise<void> {
        await sub.download();
        ModuleManager.persistState();
    }

    public async onSubModuleRemove(sub: SubModule): Promise<void> {
        await sub.undownload();
        ModuleManager.persistState();
    }

    public offlineWarningPopup: any;

    public closeOfflineWarning(): void {
        this.offlineWarningPopup?.close();
    }
}
