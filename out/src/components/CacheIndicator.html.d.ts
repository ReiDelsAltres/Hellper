import { Component, TemplateHolder, Observable } from "@Purper";
type CacheSource = 'cache' | 'network' | 'unknown';
export default class CacheIndicator extends Component {
    source: Observable<CacheSource>;
    loaded: Observable<boolean>;
    fileSize: Observable<number>;
    networkCost: Observable<number>;
    fileName: Observable<string>;
    private sourceIcon;
    private sourceSection;
    private sourceTooltip;
    private statusIcon;
    private statusSection;
    private statusTooltip;
    private sizeValue;
    private sizeTooltip;
    private fileNameValue;
    private fileNameTooltip;
    private networkSection;
    private networkValue;
    private networkTooltip;
    private _refsReady;
    private _pendingUpdates;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    private _applyOrDefer;
    private _updateSource;
    private _updateLoaded;
    private _updateSize;
    private _updateNetwork;
    private _updateFileName;
    private formatBytes;
}
export {};
//# sourceMappingURL=CacheIndicator.html.d.ts.map