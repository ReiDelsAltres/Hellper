import { IElementHolder, Component } from "@Purper";

export default class ReButton extends Component {
    private iconSlot?: HTMLElement;

    static get observedAttributes() {
        return [
            'variant', 'size', 'color', 'icon', 'disabled',
            'loading', 'full-width', 'type', 'href'
        ];
    }

    protected preLoad(holder: IElementHolder): Promise<void> {
        this.iconSlot = holder.element.querySelector('#icon-slot') as HTMLElement;

        this.addEventListener('click', this.handleClick);
        this.updateButton();

        // Обработка изменений атрибутов
        this.onAttributeChangedCallback((name, oldValue, newValue) => {
            this.updateButton();
        });
        return Promise.resolve();
    }

    private updateButton() {
        // Обновляем классы хоста (для icon-only)
        this.updateHostClasses();

        // Обновляем иконку
        this.updateIcon();
    }

    private updateHostClasses() {
        // Только иконка
        if (this.hasAttribute('icon') && !this.textContent.trim()) {
            this.classList.add('icon-only');
        } else {
            this.classList.remove('icon-only');
        }
    }

    private updateIcon() {
        const iconName = this.getAttribute('icon');
        const color = this.getAttribute('color') || 'primary';
        const variant = this.getAttribute('variant') || 'filled';

        if (iconName) {
            // Проверяем, есть ли уже re-icon
            let existingIcon = this.iconSlot!.querySelector('re-icon');

            if (existingIcon) {
                existingIcon.setAttribute('icon', iconName);
            } else {
                // Создаем новую иконку
                const reIcon = document.createElement('re-icon');
                reIcon.setAttribute('icon', iconName);
                reIcon.setAttribute('size', 'sm');
                if (variant === 'filled')
                    reIcon.setAttribute('variant', 'contrast');
                reIcon.setAttribute('color', color);
                this.iconSlot!.appendChild(reIcon);
            }

            this.iconSlot!.classList.add('has-icon');
        } else {
            this.iconSlot!.innerHTML = '';
            this.iconSlot!.classList.remove('has-icon');
        }
    }

    private handleClick(event: MouseEvent) {
        // Предотвращаем клик если кнопка отключена или загружается
        if (this.hasAttribute('disabled') || this.hasAttribute('loading')) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        // Эмитируем кастомное событие
        this.dispatchEvent(new CustomEvent('button-click', {
            detail: {
                variant: this.getAttribute('variant'),
                color: this.getAttribute('color'),
                size: this.getAttribute('size')
            },
            bubbles: true,
            cancelable: true
        }));
    }

    // Публичные методы для управления состоянием кнопки

    /**
     * Показать состояние загрузки
     */
    public showLoading() {
        this.setAttribute('loading', '');
    }

    /**
     * Скрыть состояние загрузки
     */
    public hideLoading() {
        this.removeAttribute('loading');
    }

    /**
     * Отключить кнопку
     */
    public disable() {
        this.setAttribute('disabled', '');
    }

    /**
     * Включить кнопку
     */
    public enable() {
        this.removeAttribute('disabled');
    }

    /**
     * Установить иконку
     * @param {string} iconName - название иконки
     */
    public setIcon(iconName: string) {
        if (iconName) {
            this.setAttribute('icon', iconName);
        } else {
            this.removeAttribute('icon');
        }
    }

    /**
     * Установить вариант кнопки
     * @param {'filled'|'outlined'|'text'} variant - вариант кнопки
     */
    public setVariant(variant: 'filled' | 'outlined' | 'text') {
        this.setAttribute('variant', variant);
    }

    /**
     * Установить цвет кнопки
     * @param {'primary'|'secondary'|'tertiary'|'additional'|'success'|'warning'|'error'|'info'} color - цвет кнопки
     */
    public setColor(color: 'primary' | 'secondary' | 'tertiary' | 'additional' | 'success' | 'warning' | 'error' | 'info') {
        this.setAttribute('color', color);
    }

    /**
     * Установить размер кнопки
     * @param {'small'|'medium'|'large'} size - размер кнопки
     */
    public setSize(size: 'small' | 'medium' | 'large') {
        this.setAttribute('size', size);
    }

    /**
     * Программный клик по кнопке
     */
    public click() {
        if (!this.hasAttribute('disabled') && !this.hasAttribute('loading')) {
            super.click();
        }
    }

    /**
     * Фокус на кнопке
     */
    public focus() {
        super.focus();
    }

    /**
     * Снять фокус с кнопки
     */
    public blur() {
        super.blur();
    }
}
