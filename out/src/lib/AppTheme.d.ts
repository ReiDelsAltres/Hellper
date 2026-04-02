import { AppThemeConfig } from "@Purper";
export default class AppTheme {
    readonly config: AppThemeConfig;
    constructor(config: AppThemeConfig);
    get name(): string;
    get palette(): string;
    get displayName(): string;
}
/** Registry of all app themes (populated by theme files) */
export declare const APP_THEMES: AppTheme[];
/** Helper to register and track a theme */
export declare function defineAppTheme(config: AppThemeConfig): AppTheme;
//# sourceMappingURL=AppTheme.d.ts.map