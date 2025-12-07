import { IElementHolder, Component } from "@Purper";
/**
 * ReIcon — универсальный компонент иконки в стиле ReButton/ReChip
 * Содержит встроенную библиотеку Material Design иконок
 *
 * Атрибуты:
 * - icon: имя иконки из библиотеки
 * - size: xs | sm | md | lg | xl | xxl
 * - color: primary | secondary | tertiary | additional | success | warning | error | info | text | text-secondary | empty
 * - variant: (default) | contrast | outlined
 * - interactive: добавляет hover эффекты
 * - spin: анимация вращения
 * - pulse: анимация пульсации
 * - disabled: отключённое состояние
 * - rotate: 90 | 180 | 270
 * - flip: horizontal | vertical | both
 * - badge: текст или пустая строка для точки
 */
export default class ReIcon extends Component {
    private iconWrapper?;
    private svgElement?;
    /**
     * Библиотека предустановленных иконок Material Design
     */
    private static readonly iconLibrary;
    static get observedAttributes(): string[];
    protected preLoad(holder: IElementHolder): Promise<void>;
    /**
     * Создаёт или обновляет SVG элемент с иконкой
     */
    private updateIcon;
    /**
     * Получить список всех доступных иконок
     */
    static getAvailableIcons(): string[];
    /**
     * Проверить, существует ли иконка в библиотеке
     */
    static hasIcon(name: string): boolean;
    /**
     * Установить иконку
     */
    setIcon(name: string): void;
    /**
     * Установить размер
     */
    setSize(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'): void;
    /**
     * Установить цвет
     */
    setColor(color: 'primary' | 'secondary' | 'tertiary' | 'additional' | 'success' | 'warning' | 'error' | 'info' | 'text' | 'empty'): void;
    /**
     * Установить вариант
     */
    setVariant(variant: 'contrast' | 'outlined' | ''): void;
    /**
     * Включить/выключить вращение
     */
    setSpin(enabled: boolean): void;
    /**
     * Включить/выключить пульсацию
     */
    setPulse(enabled: boolean): void;
    /**
     * Отключить/включить иконку
     */
    setDisabled(disabled: boolean): void;
    /**
     * Установить бейдж
     */
    setBadge(value: string | null): void;
}
//# sourceMappingURL=ReIcon.html.d.ts.map