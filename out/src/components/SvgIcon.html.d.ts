import { IElementHolder, Component } from "@Purper";
/**
 * Типы для системы иконок
 */
type IconName = 'home' | 'user' | 'settings' | 'copy' | 'menu' | 'close' | 'arrow-left' | 'arrow-right' | 'search' | 'heart' | 'star' | 'palette' | 'info' | 'warning' | 'error' | 'success' | string;
type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ColorVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'info' | 'text';
/**
 * Интерфейс для конфигурации иконок
 */
interface IconConfig {
    name: string;
    path: string;
    viewBox?: string;
}
/**
 * Универсальный компонент SVG иконок с поддержкой тем и интерактивности
 * Поддерживает предустановленные иконки, кастомные SVG пути и полные SVG элементы
 */
export default class SvgIcon extends Component {
    private svgElement;
    private containerElement;
    /**
     * Библиотека предустановленных иконок Material Design
     */
    private readonly iconLibrary;
    /**
     * Атрибуты, за которыми следит компонент
     */
    static get observedAttributes(): string[];
    /**
     * Инициализация компонента после загрузки HTML шаблона
     */
    protected preLoad(holder: IElementHolder): Promise<void>;
    /**
     * Получение ссылок на DOM элементы
     */
    private initializeElements;
    /**
     * Обновление всех свойств при инициализации
     */
    private updateAllProperties;
    /**
     * Настройка отслеживания изменений атрибутов
     */
    private setupAttributeWatchers;
    /**
     * Прикрепление обработчиков событий
     */
    private attachEventListeners;
    /**
     * Обновление иконки
     */
    private updateIcon;
    /**
     * Парсинг кастомных SVG иконок
     */
    private parseCustomIcon;
    /**
     * Парсинг полного SVG элемента
     */
    private parseFullSvg;
    /**
     * Обновление размера иконки
     */
    private updateSize;
    /**
     * Очистка классов размера
     */
    private clearSizeClasses;
    /**
     * Проверка валидности размера
     */
    private isValidSizeVariant;
    /**
     * Обновление цветов иконки
     */
    private updateColors;
    /**
     * Очистка цветовых классов
     */
    private clearColorClasses;
    /**
     * Проверка валидности цвета
     */
    private isValidColorVariant;
    /**
     * Обновление интерактивности
     */
    private updateInteractivity;
    /**
     * Обновление viewBox
     */
    private updateViewBox;
    /**
     * Обновление поворота иконки
     */
    private updateRotation;
    /**
     * Проверка булевого атрибута
     */
    private isBooleanAttribute;
    /**
     * Проверка наличия hover эффекта
     */
    private hasHoverEffect;
    /**
     * Проверка кликабельности
     */
    private isClickable;
    /**
     * Установка иконки
     */
    setIcon(iconName: IconName): this;
    /**
     * Установка размера
     */
    setSize(size: SizeVariant | string): this;
    /**
     * Установка цвета из темы
     */
    setColor(color: ColorVariant): this;
    /**
     * Установка кастомного цвета заливки
     */
    setFill(fill: string): this;
    /**
     * Установка цвета обводки
     */
    setStroke(stroke: string): this;
    /**
     * Установка толщины обводки
     */
    setStrokeWidth(width: string): this;
    /**
     * Включение/отключение hover эффекта
     */
    setHover(enabled: boolean): this;
    /**
     * Включение/отключение кликабельности
     */
    setClickable(enabled: boolean): this;
    /**
     * Установка поворота
     */
    setRotation(degrees: number): this;
    /**
     * Установка viewBox
     */
    setViewBox(viewBox: string): this;
    /**
     * Получение списка доступных иконок
     */
    getAvailableIcons(): string[];
    /**
     * Добавление кастомной иконки в библиотеку
     */
    addIcon(name: string, config: IconConfig): void;
    /**
     * Проверка существования иконки в библиотеке
     */
    hasIcon(name: string): boolean;
}
export {};
//# sourceMappingURL=SvgIcon.html.d.ts.map