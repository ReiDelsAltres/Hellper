import { IElementHolder, Component } from "@Purper";
export default class ReButton extends Component {
    private iconSlot?;
    static get observedAttributes(): string[];
    protected preLoad(holder: IElementHolder): Promise<void>;
    private updateButton;
    private updateHostClasses;
    private updateIcon;
    private handleClick;
    /**
     * Показать состояние загрузки
     */
    showLoading(): void;
    /**
     * Скрыть состояние загрузки
     */
    hideLoading(): void;
    /**
     * Отключить кнопку
     */
    disable(): void;
    /**
     * Включить кнопку
     */
    enable(): void;
    /**
     * Установить иконку
     * @param {string} iconName - название иконки
     */
    setIcon(iconName: string): void;
    /**
     * Установить вариант кнопки
     * @param {'filled'|'outlined'|'text'} variant - вариант кнопки
     */
    setVariant(variant: 'filled' | 'outlined' | 'text'): void;
    /**
     * Установить цвет кнопки
     * @param {'primary'|'secondary'|'tertiary'|'additional'|'success'|'warning'|'error'|'info'} color - цвет кнопки
     */
    setColor(color: 'primary' | 'secondary' | 'tertiary' | 'additional' | 'success' | 'warning' | 'error' | 'info'): void;
    /**
     * Установить размер кнопки
     * @param {'small'|'medium'|'large'} size - размер кнопки
     */
    setSize(size: 'small' | 'medium' | 'large'): void;
    /**
     * Программный клик по кнопке
     */
    click(): void;
    /**
     * Фокус на кнопке
     */
    focus(): void;
    /**
     * Снять фокус с кнопки
     */
    blur(): void;
}
//# sourceMappingURL=ReButton.html.d.ts.map