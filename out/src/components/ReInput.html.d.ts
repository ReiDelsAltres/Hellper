import { IElementHolder, Component } from "@Purper";
export default class ReInput extends Component {
    private input?;
    private icon?;
    private clearBtn?;
    static get observedAttributes(): string[];
    protected preLoad(holder: IElementHolder): Promise<void>;
    private updateInput;
    private updateHostClasses;
    private updateIcon;
    private updateClearButton;
    private applyAttributesToInput;
    private handleInput;
    private handleChange;
    private handleFocus;
    private handleBlur;
    /** Получить текущее значение */
    getValue(): string;
    /** Установить значение */
    setValue(val: string): void;
    /** Очистить поле */
    clear(): void;
    /** Фокус на поле */
    focus(): void;
    /** Снять фокус */
    blur(): void;
    /** Включить поле */
    enable(): void;
    /** Отключить поле */
    disable(): void;
    /** Установить иконку */
    setIcon(iconName: string): void;
    /** Установить placeholder */
    setPlaceholder(text: string): void;
    /** Установить вариант */
    setVariant(variant: 'filled' | 'outlined' | 'text'): void;
    /** Установить цвет */
    setColor(color: 'primary' | 'secondary' | 'tertiary' | 'additional' | 'success' | 'warning' | 'error' | 'info'): void;
    /** Установить размер */
    setSize(size: 'small' | 'medium' | 'large'): void;
}
//# sourceMappingURL=ReInput.html.d.ts.map