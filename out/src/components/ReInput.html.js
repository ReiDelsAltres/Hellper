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
    errorMsg;
    _isValid = true;
    _validationMessage = '';
    static get observedAttributes() {
        return [
            'value', 'type', 'placeholder', 'disabled', 'readonly',
            'size', 'color', 'icon', 'clearable', 'mini',
            'min', 'max', 'minlength', 'maxlength', 'step', 'pattern'
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
        this.input?.addEventListener('keydown', (e) => this.handleKeydown(e));
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
        if (iconName && this.icon) {
            let existingIcon = this.icon.querySelector('re-icon');
            if (existingIcon) {
                existingIcon.setAttribute('icon', iconName);
                const inputSize = this.getAttribute('size') || '';
                const mapSize = inputSize === 'small' ? 'sm' : (inputSize === 'large' ? 'lg' : 'md');
                existingIcon.setAttribute('size', mapSize);
                existingIcon.setAttribute('color', color);
            }
            else {
                const reIcon = document.createElement('re-icon');
                reIcon.setAttribute('icon', iconName);
                const inputSize = this.getAttribute('size') || '';
                const mapSize = inputSize === 'small' ? 'sm' : (inputSize === 'large' ? 'lg' : 'md');
                reIcon.setAttribute('size', mapSize);
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
        // Validation attributes
        const min = this.getAttribute('min');
        const max = this.getAttribute('max');
        const minlength = this.getAttribute('minlength');
        const maxlength = this.getAttribute('maxlength');
        const step = this.getAttribute('step');
        const pattern = this.getAttribute('pattern');
        if (min != null)
            this.input.min = min;
        else
            this.input.removeAttribute('min');
        if (max != null)
            this.input.max = max;
        else
            this.input.removeAttribute('max');
        if (minlength != null)
            this.input.minLength = parseInt(minlength, 10);
        else
            this.input.removeAttribute('minlength');
        if (maxlength != null)
            this.input.maxLength = parseInt(maxlength, 10);
        else
            this.input.removeAttribute('maxlength');
        if (step != null)
            this.input.step = step;
        else
            this.input.removeAttribute('step');
        if (pattern != null)
            this.input.pattern = pattern;
        else
            this.input.removeAttribute('pattern');
    }
    handleInput(event) {
        const target = event.target;
        const type = this.getAttribute('type');
        // Block invalid number input (validate on each input)
        if (type === 'number') {
            const newValue = target.value;
            if (newValue !== '' && newValue !== '-') {
                const numValue = parseFloat(newValue);
                const min = this.getAttribute('min');
                const max = this.getAttribute('max');
                // If value exceeds max, revert to max
                if (max != null && numValue > parseFloat(max)) {
                    target.value = max;
                    this.setAttribute('value', max);
                    this.updateClearButton();
                    this.dispatchEvent(new CustomEvent('input-change', {
                        detail: { value: max },
                        bubbles: true,
                        cancelable: true
                    }));
                    return;
                }
            }
        }
        // Block input exceeding maxlength (backup for paste events)
        const maxlength = this.getAttribute('maxlength');
        if (maxlength != null && type !== 'number' && type !== 'date') {
            const maxLen = parseInt(maxlength, 10);
            if (target.value.length > maxLen) {
                target.value = target.value.substring(0, maxLen);
            }
        }
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
        this.validate();
        this.dispatchEvent(new CustomEvent('input-blur', { bubbles: true }));
    }
    handleKeydown(event) {
        const type = this.getAttribute('type');
        // Allow control keys
        if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
            return;
        }
        // Allow Ctrl/Cmd combinations
        if (event.ctrlKey || event.metaKey) {
            return;
        }
        // Number input restriction
        if (type === 'number') {
            const currentValue = this.input?.value || '';
            const selectionStart = this.input?.selectionStart || 0;
            const selectionEnd = this.input?.selectionEnd || 0;
            // Allow minus sign at the beginning only if min allows negative
            const min = this.getAttribute('min');
            const allowNegative = min == null || parseFloat(min) < 0;
            if (event.key === '-' && selectionStart === 0 && !currentValue.includes('-') && allowNegative) {
                return;
            }
            // Allow decimal point (only one)
            if ((event.key === '.' || event.key === ',') && !currentValue.includes('.') && !currentValue.includes(',')) {
                return;
            }
            // Allow digits, but check if result would exceed max
            if (/^[0-9]$/.test(event.key)) {
                const max = this.getAttribute('max');
                if (max != null) {
                    // Simulate what the new value would be
                    const before = currentValue.substring(0, selectionStart);
                    const after = currentValue.substring(selectionEnd);
                    const newValue = before + event.key + after;
                    const numValue = parseFloat(newValue);
                    // Block if exceeds max (but allow typing if incomplete, e.g. "1" when max is "100")
                    if (!isNaN(numValue) && numValue > parseFloat(max)) {
                        event.preventDefault();
                        return;
                    }
                }
                return;
            }
            event.preventDefault();
        }
        // Date input - browser handles natively with type="date"
        if (type === 'date') {
            // Native date input handles keyboard interaction
            return;
        }
        // String length restriction (maxlength)
        const maxlength = this.getAttribute('maxlength');
        if (maxlength != null && type !== 'number' && type !== 'date') {
            const currentLength = this.input?.value.length || 0;
            const maxLen = parseInt(maxlength, 10);
            const selectionLength = (this.input?.selectionEnd || 0) - (this.input?.selectionStart || 0);
            if (currentLength - selectionLength >= maxLen && event.key.length === 1) {
                event.preventDefault();
                return;
            }
        }
        // Pattern restriction - block characters that don't match pattern
        const pattern = this.getAttribute('pattern');
        if (pattern != null && event.key.length === 1) {
            const currentValue = this.input?.value || '';
            const selectionStart = this.input?.selectionStart || 0;
            const selectionEnd = this.input?.selectionEnd || 0;
            // Simulate new value
            const before = currentValue.substring(0, selectionStart);
            const after = currentValue.substring(selectionEnd);
            const newValue = before + event.key + after;
            // Check if new value could potentially match pattern (partial match)
            // For strict blocking, we check if the character is valid in context
            const regex = new RegExp(`^${pattern}$`);
            const partialRegex = new RegExp(`^(${pattern.replace(/\+/g, '*').replace(/\{\\d+,?\\d*\}/g, '*')})?`);
            // If the pattern is simple (e.g., [a-zA-Z]+), block invalid chars
            if (pattern.match(/^\[[\w-]+\]\+?$/) || pattern.match(/^\[[\w-]+\]\*?$/)) {
                const charPattern = pattern.replace(/[\+\*]$/, '');
                const charRegex = new RegExp(charPattern);
                if (!charRegex.test(event.key)) {
                    event.preventDefault();
                    return;
                }
            }
        }
    }
    validate() {
        if (!this.input)
            return true;
        const type = this.getAttribute('type');
        const value = this.input.value;
        let isValid = true;
        let message = '';
        // Number validation
        if (type === 'number' && value !== '') {
            const numValue = parseFloat(value);
            const min = this.getAttribute('min');
            const max = this.getAttribute('max');
            if (min != null && numValue < parseFloat(min)) {
                isValid = false;
                message = `Значение должно быть не менее ${min}`;
            }
            if (max != null && numValue > parseFloat(max)) {
                isValid = false;
                message = `Значение должно быть не более ${max}`;
            }
        }
        // Date validation
        if (type === 'date' && value !== '') {
            const dateValue = new Date(value);
            const min = this.getAttribute('min');
            const max = this.getAttribute('max');
            if (min != null && dateValue < new Date(min)) {
                isValid = false;
                message = `Дата должна быть не ранее ${min}`;
            }
            if (max != null && dateValue > new Date(max)) {
                isValid = false;
                message = `Дата должна быть не позднее ${max}`;
            }
        }
        // String length validation
        if (type !== 'number' && type !== 'date' && value !== '') {
            const minlength = this.getAttribute('minlength');
            const maxlength = this.getAttribute('maxlength');
            if (minlength != null && value.length < parseInt(minlength, 10)) {
                isValid = false;
                message = `Минимальная длина: ${minlength} символов`;
            }
            if (maxlength != null && value.length > parseInt(maxlength, 10)) {
                isValid = false;
                message = `Максимальная длина: ${maxlength} символов`;
            }
        }
        // Pattern validation
        const pattern = this.getAttribute('pattern');
        if (pattern != null && value !== '') {
            const regex = new RegExp(`^${pattern}$`);
            if (!regex.test(value)) {
                isValid = false;
                message = this.getAttribute('title') || 'Значение не соответствует требуемому формату';
            }
        }
        this._isValid = isValid;
        this._validationMessage = message;
        if (isValid) {
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
        else {
            this.classList.remove('valid');
            this.classList.add('invalid');
        }
        this.dispatchEvent(new CustomEvent('input-validate', {
            detail: { valid: isValid, message },
            bubbles: true
        }));
        return isValid;
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
    /** Установить цвет */
    setColor(color) {
        this.setAttribute('color', color);
    }
    /** Установить размер */
    setSize(size) {
        this.setAttribute('size', size);
    }
    // ─────────────────────────────────────────────────────────────
    // Validation API
    // ─────────────────────────────────────────────────────────────
    /** Проверить валидность значения */
    isValid() {
        return this.validate();
    }
    /** Получить сообщение об ошибке валидации */
    getValidationMessage() {
        return this._validationMessage;
    }
    /** Установить ограничение для чисел */
    setNumberRange(min, max, step) {
        this.setAttribute('type', 'number');
        if (min != null)
            this.setAttribute('min', min.toString());
        else
            this.removeAttribute('min');
        if (max != null)
            this.setAttribute('max', max.toString());
        else
            this.removeAttribute('max');
        if (step != null)
            this.setAttribute('step', step.toString());
        else
            this.removeAttribute('step');
    }
    /** Установить ограничение для даты */
    setDateRange(min, max) {
        this.setAttribute('type', 'date');
        if (min != null)
            this.setAttribute('min', min);
        else
            this.removeAttribute('min');
        if (max != null)
            this.setAttribute('max', max);
        else
            this.removeAttribute('max');
    }
    /** Установить ограничение длины строки */
    setLengthRange(minlength, maxlength) {
        if (minlength != null)
            this.setAttribute('minlength', minlength.toString());
        else
            this.removeAttribute('minlength');
        if (maxlength != null)
            this.setAttribute('maxlength', maxlength.toString());
        else
            this.removeAttribute('maxlength');
    }
    /** Установить паттерн валидации */
    setPattern(pattern, title) {
        this.setAttribute('pattern', pattern);
        if (title)
            this.setAttribute('title', title);
    }
    /** Сбросить состояние валидации */
    resetValidation() {
        this._isValid = true;
        this._validationMessage = '';
        this.classList.remove('valid', 'invalid');
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