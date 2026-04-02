import { AppThemeConfig, registerAppTheme } from "@Purper";

export default class AppTheme {
    public readonly config: AppThemeConfig;

    constructor(config: AppThemeConfig) {
        this.config = config;
        registerAppTheme(config);
    }

    get name(): string { return this.config.name; }
    get palette(): string { return this.config.palette; }
    get displayName(): string { return this.config.name; }
}

/** Registry of all app themes (populated by theme files) */
export const APP_THEMES: AppTheme[] = [];

/** Helper to register and track a theme */
export function defineAppTheme(config: AppThemeConfig): AppTheme {
    const theme = new AppTheme(config);
    APP_THEMES.push(theme);
    return theme;
}
