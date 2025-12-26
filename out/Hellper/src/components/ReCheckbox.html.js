var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent } from "@Purper";
import Attribute from './../../../Purper/src/foundation/component_api/Attribute';
let ReCheckbox = class ReCheckbox extends Component {
    box;
    labelEl;
    checked = new Attribute(this, 'checked');
    static get observedAttributes() {
        return ['checked', 'disabled', 'indeterminate', 'color', 'size', 'label', 'name', 'value', 'mini'];
    }
    preLoad(holder) {
        this.box = holder.element.querySelector('.checkbox-box');
        this.labelEl = holder.element.querySelector('.checkbox-label');
        // Make focusable
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '0');
        }
        // Click toggles checked
        this.addEventListener('click', this.handleClick.bind(this));
        // Keyboard support (Space / Enter)
        this.addEventListener('keydown', this.handleKeydown.bind(this));
        // Initial state
        this.updateCheckbox();
        // Observe attribute changes
        this.onAttributeChangedCallback(() => {
            this.updateCheckbox();
        });
        return Promise.resolve();
    }
    updateCheckbox() {
        // Sync aria and visual state
        const checked = this.hasAttribute('checked');
        const indeterminate = this.hasAttribute('indeterminate');
        this.setAttribute('aria-checked', indeterminate ? 'mixed' : String(checked));
        if (checked) {
            this.classList.add('checked');
        }
        else {
            this.classList.remove('checked');
        }
        if (indeterminate) {
            this.classList.add('indeterminate');
        }
        else {
            this.classList.remove('indeterminate');
        }
        // Mini mode
        if (this.hasAttribute('mini')) {
            this.classList.add('mini');
        }
        else {
            this.classList.remove('mini');
        }
        // Apply label attribute (fallback via <slot>) and aria-label for accessibility
        if (this.labelEl) {
            const slot = this.labelEl.querySelector('slot');
            const labelAttr = this.getAttribute('label');
            if (slot) {
                // If a `label` attribute is present, use it as the slot fallback content.
                // If not present, leave slot fallback empty so slotted children (if any) are shown.
                if (labelAttr != null) {
                    slot.textContent = labelAttr;
                }
                else {
                    // Clear fallback content (do not remove assigned nodes)
                    slot.textContent = '';
                }
            }
            // Reflect label to aria-label when available
            if (labelAttr != null) {
                this.setAttribute('aria-label', labelAttr);
            }
            else {
                this.removeAttribute('aria-label');
            }
        }
    }
    handleClick(event) {
        if (this.hasAttribute('disabled')) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        this.toggle();
    }
    handleKeydown(event) {
        if (this.hasAttribute('disabled'))
            return;
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            this.toggle();
        }
    }
    // ─────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────
    /** Переключить состояние */
    toggle() {
        // Clear indeterminate on toggle
        if (this.hasAttribute('indeterminate')) {
            this.removeAttribute('indeterminate');
        }
        if (this.hasAttribute('checked')) {
            this.removeAttribute('checked');
        }
        else {
            this.setAttribute('checked', '');
        }
        this.dispatchEvent(new CustomEvent('checkbox-change', {
            detail: { checked: this.isChecked(), value: this.getValue() },
            bubbles: true,
            cancelable: true
        }));
    }
    /** Установить состояние */
    setChecked(checked) {
        if (checked) {
            this.setAttribute('checked', '');
        }
        else {
            this.removeAttribute('checked');
        }
        this.removeAttribute('indeterminate');
    }
    /** Получить состояние */
    isChecked() {
        return this.hasAttribute('checked');
    }
    /** Получить значение (атрибут value или 'on') */
    getValue() {
        return this.getAttribute('value') === 'true';
    }
    /** Установить значение */
    setValue(val) {
        this.setAttribute('value', val);
    }
    /** Установить indeterminate */
    setIndeterminate(indeterminate) {
        if (indeterminate) {
            this.setAttribute('indeterminate', '');
        }
        else {
            this.removeAttribute('indeterminate');
        }
    }
    /** Включить */
    enable() {
        this.removeAttribute('disabled');
    }
    /** Отключить */
    disable() {
        this.setAttribute('disabled', '');
    }
    /** Установить цвет */
    setColor(color) {
        this.setAttribute('color', color);
    }
    /** Установить размер */
    setSize(size) {
        this.setAttribute('size', size);
    }
    /** Фокус */
    focus() {
        super.focus();
    }
    /** Снять фокус */
    blur() {
        super.blur();
    }
};
ReCheckbox = __decorate([
    ReComponent({
        markupURL: "./src/components/ReCheckbox.hmle",
        cssURL: "./src/components/ReCheckbox.html.css",
        jsURL: "./src/components/ReCheckbox.html.ts",
    }, "re-checkbox")
], ReCheckbox);
export default ReCheckbox;
//# sourceMappingURL=ReCheckbox.html.js.map