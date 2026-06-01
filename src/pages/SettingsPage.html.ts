import { Page, RePage, Module, ModuleManager, DownloadProgress, CacheManager, Observable, SubModule } from "@Purper";

@RePage({
    markupURL: "./src/pages/SettingsPage.hmle",
    cssURL: "./src/pages/SettingsPage.html.css",
}, "/settings")
export default class SettingsPage extends Page {
    public modules: Module[] = [];

    public cardStructs: ModuleCardStruct[] = [];

    public offlineWarningPopup: any;

    constructor() {
        super();
        this.modules = ModuleManager.getAll();
    }

    public async preInit(): Promise<void> {
        // ensure we don't append duplicates if preInit runs multiple times
        this.cardStructs = [];
        this.modules = ModuleManager.getAll();

        for (const module of this.modules) {
            const struct = new ModuleCardStruct();
            struct.version = module.installedVersion;
            struct.module = module;
            struct.class = new Observable<string>(this.computeCardClass(module));
            struct.statusColor = new Observable<string>(this.computeStatusColor(module));
            struct.chips = new Observable<{ color: string, size: string, text: string }[]>([]);

            const update = () => {
                struct.class!.setObject(this.computeCardClass(module));
                struct.statusColor!.setObject(this.computeStatusColor(module));

                const d = module.downloaded.getObject() === true;
                const a = module.isActive();
                const c = module.core;

                const transaction = struct.chips!.transaction();
                transaction.updateObject(() => {
                    const chips: { color: string, size: string, text: string }[] = [];
                    if (d && !c) chips.push({ color: 'success', size: 'small', text: 'Downloaded' });
                    if (a && !d) chips.push({ color: 'secondary', size: 'small', text: 'Ephemeral' });
                    if (d && !a && !c) chips.push({ color: 'empty', size: 'small', text: 'Disabled' });
                    if (!d && !a) chips.push({ color: 'empty', size: 'small', text: 'Not downloaded' });
                    if (!!module.downloadError.getObject()) chips.push({ color: 'error', size: 'small', text: 'Error' });
                    return chips;
                });
                transaction.commit();
            };
            update();

            const moduleSize = () => {
                const val = module.totalSize.getObject() ?? 0;
                return module.downloaded.getObject() ? this.computeSizeText(val) : this.computeEstimatedSizeText(val);
            };
            struct.size = new Observable<string>(moduleSize());
            module.totalSize.subscribe(() => struct.size!.setObject(moduleSize()));
            module.downloaded.subscribe(() => struct.size!.setObject(moduleSize()));

            module.enabled.subscribe(update);
            module.downloaded.subscribe(update);
            module.downloadError.subscribe(update);

            // Per-module download progress
            struct.progress = {
                active: new Observable<boolean>(false),
                percent: new Observable<number>(0),
                text: new Observable<string>(''),
                file: new Observable<string>(''),
                speed: new Observable<string>(''),
            };
            // flag whether module itself is downloading (gives priority to module downloads)
            struct.ownActive = false;

            module.downloadProgress.subscribe((progress: DownloadProgress) => {
                struct.ownActive = progress.active;
                struct.progress!.active.setObject(progress.active);
                if (progress.active) {
                    struct.progress!.file.setObject(progress.currentFile);
                    const pct = progress.totalBytes > 0
                        ? Math.round((progress.downloadedBytes / progress.totalBytes) * 100)
                        : (progress.totalFiles > 0 ? Math.round((progress.completedFiles / progress.totalFiles) * 100) : 0);
                    struct.progress!.percent.setObject(pct);
                    struct.progress!.text.setObject(
                        `${CacheManager.formatBytes(progress.downloadedBytes)} / ${CacheManager.formatBytes(progress.totalBytes)}`
                    );
                    struct.progress!.speed.setObject(
                        progress.speed > 0 ? `${CacheManager.formatBytes(progress.speed)}/с` : ''
                    );
                } else {
                    struct.progress!.percent.setObject(0);
                    struct.progress!.text.setObject('');
                    struct.progress!.file.setObject('');
                    struct.progress!.speed.setObject('');
                }
            });

            // Sub-modules
            struct.subs = [];
            struct.subsTotal = new Observable<string>('');
            const updateSubsTotal = () => {
                let total = 0;
                for (const s of module.getSubModules()) {
                    if (!s.inbuilt && s.downloaded.getObject()) {
                        total += (s.totalSize.getObject() ?? 0);
                    }
                }
                struct.subsTotal!.setObject(total > 0 ? this.computeSizeText(total) : '');
            };
            for (const sub of module.getSubModules()) {
                const sStruct: any = {
                    sub,
                    class: new Observable<string>(
                        sub.inbuilt ? 'submodule-chip submodule-chip-inbuilt' : (sub.downloaded.getObject() ? 'submodule-chip submodule-chip-downloaded' : 'submodule-chip submodule-chip-not-downloaded')
                    )
                };

                if (!sub.inbuilt) {
                    sub.downloaded.subscribe(() => {
                        sStruct.class.setObject(
                            sub.downloaded.getObject() ? 'submodule-chip submodule-chip-downloaded' : 'submodule-chip submodule-chip-not-downloaded'
                        );
                    });

                    const subSizeText = () => {
                        const val = sub.totalSize.getObject() ?? 0;
                        return sub.downloaded.getObject() ? this.computeSizeText(val) : this.computeEstimatedSizeText(val);
                    };
                    sStruct.size = new Observable<string>(subSizeText());
                    sub.totalSize.subscribe(() => {
                        sStruct.size!.setObject(subSizeText());
                        updateSubsTotal();
                    });
                    sub.downloaded.subscribe(() => {
                        sStruct.size!.setObject(subSizeText());
                        updateSubsTotal();
                    });

                    // also update total when sub list is first populated
                    updateSubsTotal();

                    sStruct.progress = {
                        active: new Observable<boolean>(false),
                        percent: new Observable<number>(0),
                        file: new Observable<string>(''),
                        text: new Observable<string>(''),
                        speed: new Observable<string>('')
                    };

                    sub.downloadProgress.subscribe((progress: DownloadProgress) => {
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
                                struct.progress!.active.setObject(true);
                                struct.progress!.file.setObject(`${sub.name}${progress.currentFile ? ' — ' + progress.currentFile : ''}`);
                                struct.progress!.percent.setObject(pct);
                                struct.progress!.text.setObject(sStruct.progress.text.getObject());
                                struct.progress!.speed.setObject(sStruct.progress.speed.getObject());
                            }
                        } else {
                            sStruct.progress.percent.setObject(0);
                            sStruct.progress.file.setObject('');
                            sStruct.progress.text.setObject('');
                            sStruct.progress.speed.setObject('');

                            // when this sub finished, if no other subs or module downloading — clear module progress
                            const anyActive = struct.subs!.some((x: any) => x.progress && x.progress.active.getObject());
                            if (!anyActive && !struct.ownActive) {
                                struct.progress!.active.setObject(false);
                                struct.progress!.percent.setObject(0);
                                struct.progress!.text.setObject('');
                                struct.progress!.file.setObject('');
                                struct.progress!.speed.setObject('');
                            } else if (!struct.ownActive && anyActive) {
                                // pick first active sub and reflect its progress
                                const activeSub: any = struct.subs!.find((x: any) => x.progress && x.progress.active.getObject());
                                if (activeSub) {
                                    struct.progress!.active.setObject(true);
                                    struct.progress!.percent.setObject(activeSub.progress.percent.getObject());
                                    struct.progress!.file.setObject(`${activeSub.sub.name}${activeSub.progress.file.getObject() ? ' — ' + activeSub.progress.file.getObject() : ''}`);
                                    struct.progress!.text.setObject(activeSub.progress.text.getObject());
                                    struct.progress!.speed.setObject(activeSub.progress.speed.getObject());
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

    public async preLoad(): Promise<void> {
        // reserved for async pre-load tasks if needed
    }

    public async postLoad(): Promise<void> {
        // reserved for post-load DOM bindings if needed
    }

    private computeSizeText(bytes: number): string {
        return bytes > 0 ? CacheManager.formatBytes(bytes) : '';
    }

    private computeEstimatedSizeText(bytes: number): string {
        return bytes > 0 ? `≈ ${CacheManager.formatBytes(bytes)}` : '';
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

    public closeOfflineWarning(): void {
        this.offlineWarningPopup?.close();
    }
}

class ModuleCardStruct {
    module!: Module;
    class?: Observable<string>;
    statusColor?: Observable<string>;
    chips?: Observable<{ color: string, size: string, text: string }[]>;
    size?: Observable<string>;
    subsTotal?: Observable<string>;
    version?: string;
    progress?: {
        active: Observable<boolean>;
        percent: Observable<number>;
        text: Observable<string>;
        file: Observable<string>;
        speed: Observable<string>;
    };
    subs?: {
        sub: SubModule;
        class: Observable<string>;
        size?: Observable<string>;
        progress?: {
            active: Observable<boolean>;
            percent: Observable<number>;
            file?: Observable<string>;
            text?: Observable<string>;
            speed?: Observable<string>;
        };
    }[];
    ownActive?: boolean;
}