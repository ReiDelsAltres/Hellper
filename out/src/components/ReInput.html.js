var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent } from "@Purper";
let ReInput = class ReInput extends Component {
    input;
    icon;
    clearBtn;
    static get observedAttributes() {
        return [
            'value', 'type', 'placeholder', 'disabled', 'readonly',
            'size', 'color', 'variant', 'icon', 'clearable', 'mini'
        ];
    }
    preLoad(holder) {
        this.addEventListener('click', () => this.input?.focus());
        this.updateInput();
        // Event handlers
        this.input?.addEventListener('input', (e) => this.handleInput(e));
        this.input?.addEventListener('change', () => this.handleChange());
        this.input?.addEventListener('focus', () => this.handleFocus());
        this.input?.addEventListener('blur', () => this.handleBlur());
        // Clear button
        this.clearBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clear();
        });
        // Observe attribute changes
        this.onAttributeChangedCallback(() => {
            this.updateInput();
        });
        return Promise.resolve();
    }
    updateInput() {
        this.updateHostClasses();
        this.updateIcon();
        this.updateClearButton();
        this.applyAttributesToInput();
    }
    updateHostClasses() {
        // Icon-only (mini mode)
        if (this.hasAttribute('mini')) {
            this.classList.add('mini');
        }
        else {
            this.classList.remove('mini');
        }
    }
    updateIcon() {
        const iconName = this.getAttribute('icon');
        const color = this.getAttribute('color') || 'primary';
        const variant = this.getAttribute('variant') || 'outlined';
        if (iconName && this.icon) {
            let existingIcon = this.icon.querySelector('re-icon');
            if (existingIcon) {
                existingIcon.setAttribute('icon', iconName);
                const inputSize = this.getAttribute('size') || '';
                const mapSize = inputSize === 'small' ? 'sm' : (inputSize === 'large' ? 'lg' : 'md');
                existingIcon.setAttribute('size', mapSize);
                existingIcon.setAttribute('color', color);
                if (variant === 'filled')
                    existingIcon.setAttribute('variant', 'contrast');
                else
                    existingIcon.removeAttribute('variant');
            }
            else {
                const reIcon = document.createElement('re-icon');
                reIcon.setAttribute('icon', iconName);
                const inputSize = this.getAttribute('size') || '';
                const mapSize = inputSize === 'small' ? 'sm' : (inputSize === 'large' ? 'lg' : 'md');
                reIcon.setAttribute('size', mapSize);
                if (variant === 'filled')
                    reIcon.setAttribute('variant', 'contrast');
                reIcon.setAttribute('color', color);
                this.icon.appendChild(reIcon);
            }
            this.icon.classList.add('has-icon');
        }
        else if (this.icon) {
            this.icon.innerHTML = '';
            this.icon.classList.remove('has-icon');
        }
    }
    updateClearButton() {
        if (!this.clearBtn)
            return;
        const clearable = this.hasAttribute('clearable');
        const hasValue = (this.input?.value || '').length > 0;
        if (clearable && hasValue) {
            let existingIcon = this.clearBtn.querySelector('re-icon');
            if (!existingIcon) {
                const reIcon = document.createElement('re-icon');
                reIcon.setAttribute('icon', 'close');
                reIcon.setAttribute('size', 'sm');
                reIcon.setAttribute('color', 'empty');
                reIcon.setAttribute('interactive', '');
                this.clearBtn.appendChild(reIcon);
            }
            this.clearBtn.classList.add('has-clear');
        }
        else {
            this.clearBtn.innerHTML = '';
            this.clearBtn.classList.remove('has-clear');
        }
    }
    applyAttributesToInput() {
        if (!this.input)
            return;
        const type = this.getAttribute('type') || 'text';
        this.input.type = type;
        const placeholder = this.getAttribute('placeholder');
        if (placeholder != null)
            this.input.placeholder = placeholder;
        const value = this.getAttribute('value');
        if (value != null && this.input.value !== value)
            this.input.value = value;
        this.input.disabled = this.hasAttribute('disabled');
        this.input.readOnly = this.hasAttribute('readonly');
    }
    handleInput(event) {
        const target = event.target;
        this.setAttribute('value', target.value);
        this.updateClearButton();
        this.dispatchEvent(new CustomEvent('input-change', {
            detail: { value: target.value },
            bubbles: true,
            cancelable: true
        }));
    }
    handleChange() {
        if (!this.input)
            return;
        this.dispatchEvent(new CustomEvent('input-commit', {
            detail: { value: this.input.value },
            bubbles: true,
            cancelable: true
        }));
    }
    handleFocus() {
        this.classList.add('focused');
        this.dispatchEvent(new CustomEvent('input-focus', { bubbles: true }));
    }
    handleBlur() {
        this.classList.remove('focused');
        this.dispatchEvent(new CustomEvent('input-blur', { bubbles: true }));
    }
    // ─────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────
    /** Получить текущее значение */
    getValue() {
        return this.input ? this.input.value : this.getAttribute('value') || '';
    }
    /** Установить значение */
    setValue(val) {
        if (this.input)
            this.input.value = val;
        this.setAttribute('value', val);
        this.updateClearButton();
    }
    /** Очистить поле */
    clear() {
        this.setValue('');
        this.input?.focus();
        this.dispatchEvent(new CustomEvent('input-clear', { bubbles: true }));
    }
    /** Фокус на поле */
    focus() {
        this.input?.focus();
    }
    /** Снять фокус */
    blur() {
        this.input?.blur();
    }
    /** Включить поле */
    enable() {
        this.removeAttribute('disabled');
        if (this.input)
            this.input.disabled = false;
    }
    /** Отключить поле */
    disable() {
        this.setAttribute('disabled', '');
        if (this.input)
            this.input.disabled = true;
    }
    /** Установить иконку */
    setIcon(iconName) {
        if (iconName) {
            this.setAttribute('icon', iconName);
        }
        else {
            this.removeAttribute('icon');
        }
    }
    /** Установить placeholder */
    setPlaceholder(text) {
        this.setAttribute('placeholder', text);
    }
    /** Установить вариант */
    setVariant(variant) {
        this.setAttribute('variant', variant);
    }
    /** Установить цвет */
    setColor(color) {
        this.setAttribute('color', color);
    }
    /** Установить размер */
    setSize(size) {
        this.setAttribute('size', size);
    }
};
ReInput = __decorate([
    ReComponent({
        markupURL: "./src/components/ReInput.hmle",
        cssURL: "./src/components/ReInput.html.css",
        jsURL: "./src/components/ReInput.html.ts",
        class: ReInput,
    }, "re-input")
], ReInput);
export default ReInput;
//# sourceMappingURL=ReInput.html.js.map