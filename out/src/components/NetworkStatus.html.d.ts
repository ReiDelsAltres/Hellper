import { Component, TemplateHolder } from "@Purper";
export default class NetworkStatus extends Component {
    private statusIcon;
    private statusText;
    private sourceIcon;
    private sourceText;
    private pageSourceEl;
    private activityList;
    private emptyState;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    private updatePageSource;
    private renderActivities;
    private shortenUrl;
    private formatSize;
    private formatSpeed;
    private escapeHtml;
    onDisconnected(): void;
}
//# sourceMappingURL=NetworkStatus.html.d.ts.map