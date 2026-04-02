var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent, ServiceWorker } from "@Purper";
let NetworkStatus = class NetworkStatus extends Component {
    statusIcon;
    statusText;
    sourceIcon;
    sourceText;
    pageSourceEl;
    activityList;
    emptyState;
    async preLoad(holder) {
        ServiceWorker.online.subscribe((online) => {
            this.statusIcon.Icon.setObject(online ? 'wifi' : 'wifi_off');
            this.statusText.textContent = online ? 'Online' : 'Offline';
            this.statusIcon.Color.setObject(online ? 'success' : 'error');
        });
        ServiceWorker.pageSource.subscribe((source) => {
            this.updatePageSource(source);
        });
        ServiceWorker.fetchActivities.subscribe((activities) => {
            this.renderActivities(activities);
        });
        ServiceWorker.enableFetchTracking();
    }
    updatePageSource(source) {
        switch (source) {
            case 'cache':
                this.sourceIcon.Icon.setObject('cached');
                this.sourceText.textContent = 'From Cache';
                this.sourceIcon.Color.setObject('warning');
                break;
            case 'network':
                this.sourceIcon.Icon.setObject('language');
                this.sourceText.textContent = 'From Network';
                this.sourceIcon.Color.setObject('success');
                break;
            default:
                this.sourceIcon.Icon.setObject('help_outline');
                this.sourceText.textContent = 'Unknown';
                this.sourceIcon.Color.setObject('inherit');
        }
    }
    renderActivities(activities) {
        const items = this.activityList.querySelectorAll('.activity-item');
        items.forEach(el => el.remove());
        if (activities.length === 0) {
            this.emptyState.style.display = '';
            return;
        }
        this.emptyState.style.display = 'none';
        for (const item of activities) {
            const el = document.createElement('div');
            el.classList.add('activity-item');
            el.classList.add(`status-${item.status}`);
            const urlShort = this.shortenUrl(item.url);
            const sizeStr = this.formatSize(item.size);
            const speedStr = item.duration && item.size && item.size > 0
                ? this.formatSpeed(item.size, item.duration)
                : '';
            const statusIcon = item.status === 'loading' ? 'downloading'
                : item.status === 'complete' ? 'check_circle'
                    : 'error';
            const statusColor = item.status === 'loading' ? 'info'
                : item.status === 'complete' ? 'success'
                    : 'error';
            const cacheLabel = item.fromCache === true ? 'cached' : item.fromCache === false ? 'network' : '';
            el.innerHTML = `
                <re-icon icon="${statusIcon}" size="small" color="${statusColor}"></re-icon>
                <div class="activity-details">
                    <span class="activity-url" title="${this.escapeHtml(item.url)}">${this.escapeHtml(urlShort)}</span>
                    <span class="activity-meta">
                        ${sizeStr ? `<span class="meta-size">${sizeStr}</span>` : ''}
                        ${speedStr ? `<span class="meta-speed">${speedStr}</span>` : ''}
                        ${cacheLabel ? `<span class="meta-source meta-${cacheLabel}">${cacheLabel}</span>` : ''}
                    </span>
                </div>
            `;
            this.activityList.appendChild(el);
        }
    }
    shortenUrl(url) {
        try {
            const u = new URL(url);
            const segments = u.pathname.split('/').filter(Boolean);
            return segments.length > 0 ? segments[segments.length - 1] + u.search : u.pathname;
        }
        catch {
            return url.length > 40 ? '...' + url.slice(-37) : url;
        }
    }
    formatSize(bytes) {
        if (!bytes || bytes < 0)
            return '';
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1048576)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    formatSpeed(bytes, durationMs) {
        if (durationMs <= 0)
            return '';
        const bps = (bytes / durationMs) * 1000;
        if (bps < 1024)
            return `${bps.toFixed(0)} B/s`;
        if (bps < 1048576)
            return `${(bps / 1024).toFixed(1)} KB/s`;
        return `${(bps / 1048576).toFixed(1)} MB/s`;
    }
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    onDisconnected() {
        ServiceWorker.disableFetchTracking();
    }
};
NetworkStatus = __decorate([
    ReComponent({
        markupURL: "./src/components/NetworkStatus.hmle",
        cssURL: "./out/src/components/NetworkStatus.html.css",
    }, "network-status")
], NetworkStatus);
export default NetworkStatus;
//# sourceMappingURL=NetworkStatus.html.js.map