import { IElementHolder, Component } from "@Purper";
export default class ReInput extends Component {
    private input?;
    private icon?;
    private clearBtn?;
    private errorMsg?;
    private _isValid;
    private _validationMessage;
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
    private handleKeydown;
    /**
     * Get normalized selection range for the input field.
     * Some input types/browsers return null for selectionStart/End,
     * so fallback to value length (caret at end). Also ensure start <= end.
     */
    private getSelection;
    private validate;
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
    /** Установить цвет */
    setColor(color: 'primary' | 'secondary' | 'tertiary' | 'additional' | 'success' | 'warning' | 'error' | 'info'): void;
    /** Установить размер */
    setSize(size: 'small' | 'medium' | 'large'): void;
    /** Проверить валидность значения */
    isValid(): boolean;
    /** Получить сообщение об ошибке валидации */
    getValidationMessage(): string;
    /** Установить ограничение для чисел */
    setNumberRange(min?: number, max?: number, step?: number): void;
    /** Установить ограничение для даты */
    setDateRange(min?: string, max?: string): void;
    /** Установить ограничение длины строки */
    setLengthRange(minlength?: number, maxlength?: number): void;
    /** Установить паттерн валидации */
    setPattern(pattern: string, title?: string): void;
    /** Сбросить состояние валидации */
    resetValidation(): void;
}
//# sourceMappingURL=ReInput.html.d.ts.map