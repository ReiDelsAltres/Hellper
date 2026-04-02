import { Component, ReComponent, TemplateHolder, Observable } from "@Purper";
import ReIcon from "./ReIcon.html.js";

type CacheSource = 'cache' | 'network' | 'unknown';

@ReComponent({
    markupURL: "./src/components/CacheIndicator.hmle",
    cssURL: "./out/src/components/CacheIndicator.html.css",
}, "cache-indicator")
export default class CacheIndicator extends Component {
    public source: Observable<CacheSource> = new Observable<CacheSource>('unknown');
    public loaded: Observable<boolean> = new Observable<boolean>(false);
    public fileSize: Observable<number> = new Observable<number>(0);
    public networkCost: Observable<number> = new Observable<number>(0);
    public fileName: Observable<string> = new Observable<string>('');

    private sourceIcon!: ReIcon;
    private sourceSection!: HTMLElement;
    private sourceTooltip!: HTMLSpanElement;
    private statusIcon!: ReIcon;
    private statusSection!: HTMLElement;
    private statusTooltip!: HTMLSpanElement;
    private sizeValue!: HTMLSpanElement;
    private sizeTooltip!: HTMLSpanElement;
    private fileNameValue!: HTMLSpanElement;
    private fileNameTooltip!: HTMLSpanElement;
    private networkSection!: HTMLElement;
    private networkValue!: HTMLSpanElement;
    private networkTooltip!: HTMLSpanElement;

    private _refsReady = false;
    private _pendingUpdates: (() => void)[] = [];

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        this._refsReady = true;

        // Flush any pending updates
        for (const fn of this._pendingUpdates) fn();
        this._pendingUpdates = [];

        this.source.subscribe((source) => {
            this._applyOrDefer(() => this._updateSource(source));
        });

        this.loaded.subscribe((loaded) => {
            this._applyOrDefer(() => this._updateLoaded(loaded));
        });

        this.fileSize.subscribe((size) => {
            this._applyOrDefer(() => this._updateSize(size));
        });

        this.networkCost.subscribe((cost) => {
            this._applyOrDefer(() => this._updateNetwork(cost));
        });

        this.fileName.subscribe((name) => {
            this._applyOrDefer(() => this._updateFileName(name));
        });
    }

    private _applyOrDefer(fn: () => void): void {
        if (this._refsReady) {
            fn();
        } else {
            this._pendingUpdates.push(fn);
        }
    }

    private _updateSource(source: CacheSource): void {
        switch (source) {
            case 'cache':
                this.sourceIcon.Icon.setObject('cached');
                this.sourceIcon.Color.setObject('warning');
                this.sourceTooltip.textContent = 'Источник: получено из кеша браузера';
                this.networkSection.style.display = 'none';
                break;
            case 'network':
                this.sourceIcon.Icon.setObject('language');
                this.sourceIcon.Color.setObject('success');
                this.sourceTooltip.textContent = 'Источник: загружено из сети';
                this.networkSection.style.display = '';
                break;
            default:
                this.sourceIcon.Icon.setObject('help_outline');
                this.sourceIcon.Color.setObject('inherit');
                this.sourceTooltip.textContent = 'Источник данных: неизвестно';
                this.networkSection.style.display = 'none';
        }
    }

    private _updateLoaded(loaded: boolean): void {
        if (loaded) {
            this.statusIcon.Icon.setObject('check_circle');
            this.statusIcon.Color.setObject('success');
            this.statusTooltip.textContent = 'Файл успешно загружен';
        } else {
            this.statusIcon.Icon.setObject('hourglass_empty');
            this.statusIcon.Color.setObject('info');
            this.statusTooltip.textContent = 'Файл загружается...';
        }
    }

    private _updateSize(size: number): void {
        this.sizeValue.textContent = size > 0 ? this.formatBytes(size) : '—';
        this.sizeTooltip.textContent = size > 0
            ? `Размер файла: ${this.formatBytes(size)}`
            : 'Размер файла неизвестен';
    }

    private _updateNetwork(cost: number): void {
        this.networkValue.textContent = cost > 0 ? this.formatBytes(cost) : '—';
        this.networkTooltip.textContent = cost > 0
            ? `Затрачено трафика: ${this.formatBytes(cost)}`
            : 'Данные о трафике недоступны';
    }

    private _updateFileName(name: string): void {
        const short = name ? name.split('/').pop() || name : '—';
        this.fileNameValue.textContent = short;
        this.fileNameTooltip.textContent = name ? `Файл: ${name}` : 'Имя файла неизвестно';
    }

    private formatBytes(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}
