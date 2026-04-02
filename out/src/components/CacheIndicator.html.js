var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent, Observable } from "@Purper";
let CacheIndicator = class CacheIndicator extends Component {
    source = new Observable('unknown');
    loaded = new Observable(false);
    fileSize = new Observable(0);
    networkCost = new Observable(0);
    fileName = new Observable('');
    sourceIcon;
    sourceSection;
    sourceTooltip;
    statusIcon;
    statusSection;
    statusTooltip;
    sizeValue;
    sizeTooltip;
    fileNameValue;
    fileNameTooltip;
    networkSection;
    networkValue;
    networkTooltip;
    _refsReady = false;
    _pendingUpdates = [];
    async preLoad(holder) {
        this._refsReady = true;
        // Flush any pending updates
        for (const fn of this._pendingUpdates)
            fn();
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
    _applyOrDefer(fn) {
        if (this._refsReady) {
            fn();
        }
        else {
            this._pendingUpdates.push(fn);
        }
    }
    _updateSource(source) {
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
    _updateLoaded(loaded) {
        if (loaded) {
            this.statusIcon.Icon.setObject('check_circle');
            this.statusIcon.Color.setObject('success');
            this.statusTooltip.textContent = 'Файл успешно загружен';
        }
        else {
            this.statusIcon.Icon.setObject('hourglass_empty');
            this.statusIcon.Color.setObject('info');
            this.statusTooltip.textContent = 'Файл загружается...';
        }
    }
    _updateSize(size) {
        this.sizeValue.textContent = size > 0 ? this.formatBytes(size) : '—';
        this.sizeTooltip.textContent = size > 0
            ? `Размер файла: ${this.formatBytes(size)}`
            : 'Размер файла неизвестен';
    }
    _updateNetwork(cost) {
        this.networkValue.textContent = cost > 0 ? this.formatBytes(cost) : '—';
        this.networkTooltip.textContent = cost > 0
            ? `Затрачено трафика: ${this.formatBytes(cost)}`
            : 'Данные о трафике недоступны';
    }
    _updateFileName(name) {
        const short = name ? name.split('/').pop() || name : '—';
        this.fileNameValue.textContent = short;
        this.fileNameTooltip.textContent = name ? `Файл: ${name}` : 'Имя файла неизвестно';
    }
    formatBytes(bytes) {
        if (bytes < 1024)
            return bytes + ' B';
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
};
CacheIndicator = __decorate([
    ReComponent({
        markupURL: "./src/components/CacheIndicator.hmle",
        cssURL: "./out/src/components/CacheIndicator.html.css",
    }, "cache-indicator")
], CacheIndicator);
export default CacheIndicator;
//# sourceMappingURL=CacheIndicator.html.js.map