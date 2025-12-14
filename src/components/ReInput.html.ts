import { IElementHolder, Component, AccessType, ReComponent } from "@Purper";

@ReComponent({
    markupURL: "./src/components/ReInput.hmle",
    cssURL: "./src/components/ReInput.html.css",
    jsURL: "./src/components/ReInput.html.ts",
    class: ReInput,
},"re-input")
export default class ReInput extends Component {
    private input?: HTMLInputElement;
    private icon?: HTMLElement;
    private clearBtn?: HTMLElement;

    static get observedAttributes() {
        return [
            'value', 'type', 'placeholder', 'disabled', 'readonly',
            'size', 'color', 'variant', 'icon', 'clearable', 'mini'
        ];
    }

    protected preLoad(holder: IElementHolder): Promise<void> {
        this.addEventListener('click', () => this.input?.focus());
        this.updateInput();

        // Event handlers
        this.input?.addEventListener('input', (e: Event) => this.handleInput(e));
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

    private updateInput() {
        this.updateHostClasses();
        this.updateIcon();
        this.updateClearButton();
        this.applyAttributesToInput();
    }

    private updateHostClasses() {
        // Icon-only (mini mode)
        if (this.hasAttribute('mini')) {
            this.classList.add('mini');
        } else {
            this.classList.remove('mini');
        }
    }

    private updateIcon() {
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
                if (variant === 'filled') existingIcon.setAttribute('variant', 'contrast');
                else existingIcon.removeAttribute('variant');
            } else {
                const reIcon = document.createElement('re-icon');
                reIcon.setAttribute('icon', iconName);
                const inputSize = this.getAttribute('size') || '';
                const mapSize = inputSize === 'small' ? 'sm' : (inputSize === 'large' ? 'lg' : 'md');
                reIcon.setAttribute('size', mapSize);
                if (variant === 'filled') reIcon.setAttribute('variant', 'contrast');
                reIcon.setAttribute('color', color);
                this.icon.appendChild(reIcon);
            }

            this.icon.classList.add('has-icon');
        } else if (this.icon) {
            this.icon.innerHTML = '';
            this.icon.classList.remove('has-icon');
        }
    }

    private updateClearButton() {
        if (!this.clearBtn) return;

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
        } else {
            this.clearBtn.innerHTML = '';
            this.clearBtn.classList.remove('has-clear');
        }
    }

    private applyAttributesToInput() {
        if (!this.input) return;

        const type = this.getAttribute('type') || 'text';
        this.input.type = type;
        const placeholder = this.getAttribute('placeholder');
        if (placeholder != null) this.input.placeholder = placeholder;

        const value = this.getAttribute('value');
        if (value != null && this.input.value !== value) this.input.value = value;
        this.input.disabled = this.hasAttribute('disabled');
        this.input.readOnly = this.hasAttribute('readonly');
    }

    private handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        this.setAttribute('value', target.value);
        this.updateClearButton();

        this.dispatchEvent(new CustomEvent('input-change', {
            detail: { value: target.value },
            bubbles: true,
            cancelable: true
        }));
    }

    private handleChange() {
        if (!this.input) return;
        this.dispatchEvent(new CustomEvent('input-commit', {
            detail: { value: this.input.value },
            bubbles: true,
            cancelable: true
        }));
    }

    private handleFocus() {
        this.classList.add('focused');
        this.dispatchEvent(new CustomEvent('input-focus', { bubbles: true }));
    }

    private handleBlur() {
        this.classList.remove('focused');
        this.dispatchEvent(new CustomEvent('input-blur', { bubbles: true }));
    }

    // ─────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────

    /** Получить текущее значение */
    public getValue(): string {
        return this.input ? this.input.value : this.getAttribute('value') || '';
    }

    /** Установить значение */
    public setValue(val: string) {
        if (this.input) this.input.value = val;
        this.setAttribute('value', val);
        this.updateClearButton();
    }

    /** Очистить поле */
    public clear() {
        this.setValue('');
        this.input?.focus();
        this.dispatchEvent(new CustomEvent('input-clear', { bubbles: true }));
    }

    /** Фокус на поле */
    public focus() {
        this.input?.focus();
    }

    /** Снять фокус */
    public blur() {
        this.input?.blur();
    }

    /** Включить поле */
    public enable() {
        this.removeAttribute('disabled');
        if (this.input) this.input.disabled = false;
    }

    /** Отключить поле */
    public disable() {
        this.setAttribute('disabled', '');
        if (this.input) this.input.disabled = true;
    }

    /** Установить иконку */
    public setIcon(iconName: string) {
        if (iconName) {
            this.setAttribute('icon', iconName);
        } else {
            this.removeAttribute('icon');
        }
    }

    /** Установить placeholder */
    public setPlaceholder(text: string) {
        this.setAttribute('placeholder', text);
    }

    /** Установить вариант */
    public setVariant(variant: 'filled' | 'outlined' | 'text') {
        this.setAttribute('variant', variant);
    }

    /** Установить цвет */
    public setColor(color: 'primary' | 'secondary' | 'tertiary' | 'additional' | 'success' | 'warning' | 'error' | 'info') {
        this.setAttribute('color', color);
    }

    /** Установить размер */
    public setSize(size: 'small' | 'medium' | 'large') {
        this.setAttribute('size', size);
    }
}
