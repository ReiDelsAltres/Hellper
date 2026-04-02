export default class ColorPalette {
    constructor(
        public readonly name: string,
        public readonly displayName: string,
    ) {}
}

/** All known color palettes */
export const COLOR_PALETTES: ColorPalette[] = [
    new ColorPalette('Blazor', 'Blazor'),
    new ColorPalette('Brass', 'Brass'),
    new ColorPalette('BrassDark', 'Brass Dark'),
    new ColorPalette('Chess', 'Chess'),
    new ColorPalette('Vine', 'Vine'),
];
