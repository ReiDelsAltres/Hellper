export default class ColorPalette {
    name;
    displayName;
    constructor(name, displayName) {
        this.name = name;
        this.displayName = displayName;
    }
}
/** All known color palettes */
export const COLOR_PALETTES = [
    new ColorPalette('Blazor', 'Blazor'),
    new ColorPalette('Brass', 'Brass'),
    new ColorPalette('BrassDark', 'Brass Dark'),
    new ColorPalette('Chess', 'Chess'),
    new ColorPalette('Vine', 'Vine'),
];
//# sourceMappingURL=ColorPalette.js.map