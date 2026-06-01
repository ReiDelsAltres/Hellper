import { Page, Module, Observable, SubModule } from "@Purper";
export default class SettingsPage extends Page {
    modules: Module[];
    cardStructs: ModuleCardStruct[];
    offlineWarningPopup: any;
    constructor();
    preInit(): Promise<void>;
    preLoad(): Promise<void>;
    postLoad(): Promise<void>;
    private computeSizeText;
    private computeEstimatedSizeText;
    private computeCardClass;
    private computeStatusColor;
    onModuleToggle(module: Module): Promise<void>;
    onModuleDownload(module: Module): Promise<void>;
    onModuleRemove(module: Module): Promise<void>;
    onSubModuleDownload(sub: SubModule): Promise<void>;
    onSubModuleRemove(sub: SubModule): Promise<void>;
    closeOfflineWarning(): void;
}
declare class ModuleCardStruct {
    module: Module;
    class?: Observable<string>;
    statusColor?: Observable<string>;
    chips?: Observable<{
        color: string;
        size: string;
        text: string;
    }[]>;
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
export {};
//# sourceMappingURL=SettingsPage.html.d.ts.map