import { registerAppTheme } from "@Purper";
export default class AppTheme {
    config;
    constructor(config) {
        this.config = config;
        registerAppTheme(config);
    }
    get name() { return this.config.name; }
    get palette() { return this.config.palette; }
    get displayName() { return this.config.name; }
}
/** Registry of all app themes (populated by theme files) */
export const APP_THEMES = [];
/** Helper to register and track a theme */
export function defineAppTheme(config) {
    const theme = new AppTheme(config);
    APP_THEMES.push(theme);
    return theme;
}
//# sourceMappingURL=AppTheme.js.map