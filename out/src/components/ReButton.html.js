import { Component } from "@Purper";
export default class ReButton extends Component {
    iconSlot;
    static get observedAttributes() {
        return [
            'variant', 'size', 'color', 'icon', 'disabled',
            'loading', 'full-width', 'type', 'href', "mini"
        ];
    }
    preLoad(holder) {
        this.iconSlot = holder.element.querySelector('#icon-slot');
        this.addEventListener('click', this.handleClick);
        this.updateButton();
        // Обработка изменений атрибутов
        this.onAttributeChangedCallback((name, oldValue, newValue) => {
            this.updateButton();
        });
        return Promise.resolve();
    }
    updateButton() {
        // Обновляем классы хоста (для icon-only)
        this.updateHostClasses();
        // Обновляем иконку
        this.updateIcon();
    }
    updateHostClasses() {
        // Только иконка
        if (this.hasAttribute('icon') && !this.textContent.trim()) {
            this.classList.add('icon-only');
        }
        else {
            this.classList.remove('icon-only');
        }
    }
    updateIcon() {
        const iconName = this.getAttribute('icon');
        const color = this.getAttribute('color') || 'primary';
        const variant = this.getAttribute('variant') || 'filled';
        if (iconName) {
            // Проверяем, есть ли уже re-icon
            let existingIcon = this.iconSlot.querySelector('re-icon');
            if (existingIcon) {
                existingIcon.setAttribute('icon', iconName);
                // Keep nested re-icon synced with button attributes
                const btnSize = this.getAttribute('size') || '';
                const mapSize = btnSize === 'small' ? 'sm' : (btnSize === 'large' ? 'lg' : 'md');
                existingIcon.setAttribute('size', mapSize);
                existingIcon.setAttribute('color', color);
                if (variant === 'filled')
                    existingIcon.setAttribute('variant', 'contrast');
                else
                    existingIcon.removeAttribute('variant');
            }
            else {
                // Создаем новую иконку
                const reIcon = document.createElement('re-icon');
                reIcon.setAttribute('icon', iconName);
                const btnSize = this.getAttribute('size') || '';
                const mapSize = btnSize === 'small' ? 'sm' : (btnSize === 'large' ? 'lg' : 'md');
                reIcon.setAttribute('size', mapSize);
                if (variant === 'filled')
                    reIcon.setAttribute('variant', 'contrast');
                reIcon.setAttribute('color', color);
                this.iconSlot.appendChild(reIcon);
            }
            this.iconSlot.classList.add('has-icon');
        }
        else {
            this.iconSlot.innerHTML = '';
            this.iconSlot.classList.remove('has-icon');
        }
    }
    handleClick(event) {
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
    showLoading() {
        this.setAttribute('loading', '');
    }
    /**
     * Скрыть состояние загрузки
     */
    hideLoading() {
        this.removeAttribute('loading');
    }
    /**
     * Отключить кнопку
     */
    disable() {
        this.setAttribute('disabled', '');
    }
    /**
     * Включить кнопку
     */
    enable() {
        this.removeAttribute('disabled');
    }
    /**
     * Установить иконку
     * @param {string} iconName - название иконки
     */
    setIcon(iconName) {
        if (iconName) {
            this.setAttribute('icon', iconName);
        }
        else {
            this.removeAttribute('icon');
        }
    }
    /**
     * Установить вариант кнопки
     * @param {'filled'|'outlined'|'text'} variant - вариант кнопки
     */
    setVariant(variant) {
        this.setAttribute('variant', variant);
    }
    /**
     * Установить цвет кнопки
     * @param {'primary'|'secondary'|'tertiary'|'additional'|'success'|'warning'|'error'|'info'} color - цвет кнопки
     */
    setColor(color) {
        this.setAttribute('color', color);
    }
    /**
     * Установить размер кнопки
     * @param {'small'|'medium'|'large'} size - размер кнопки
     */
    setSize(size) {
        this.setAttribute('size', size);
    }
    /**
     * Программный клик по кнопке
     */
    click() {
        if (!this.hasAttribute('disabled') && !this.hasAttribute('loading')) {
            super.click();
        }
    }
    /**
     * Фокус на кнопке
     */
    focus() {
        super.focus();
    }
    /**
     * Снять фокус с кнопки
     */
    blur() {
        super.blur();
    }
}
//# sourceMappingURL=ReButton.html.js.map