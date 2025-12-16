import { IElementHolder, Component, ReComponent } from "@Purper";

@ReComponent({
    markupURL: "./src/components/ReCheckbox.hmle",
    cssURL: "./src/components/ReCheckbox.html.css",
    jsURL: "./src/components/ReCheckbox.html.ts",
}, "re-checkbox")
export default class ReCheckbox extends Component {
    private box?: HTMLElement;
    private labelEl?: HTMLElement;

    static get observedAttributes() {
        return ['checked', 'disabled', 'indeterminate', 'color', 'size', 'label', 'name', 'value', 'mini'];
    }

    protected preLoad(holder: IElementHolder): Promise<void> {
        this.box = holder.element.querySelector('.checkbox-box') as HTMLElement;
        this.labelEl = holder.element.querySelector('.checkbox-label') as HTMLElement;

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

    private updateCheckbox() {
        // Sync aria and visual state
        const checked = this.hasAttribute('checked');
        const indeterminate = this.hasAttribute('indeterminate');

        this.setAttribute('aria-checked', indeterminate ? 'mixed' : String(checked));

        if (checked) {
            this.classList.add('checked');
        } else {
            this.classList.remove('checked');
        }

        if (indeterminate) {
            this.classList.add('indeterminate');
        } else {
            this.classList.remove('indeterminate');
        }

        // Mini mode
        if (this.hasAttribute('mini')) {
            this.classList.add('mini');
        } else {
            this.classList.remove('mini');
        }
    }

    private handleClick(event: MouseEvent) {
        if (this.hasAttribute('disabled')) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        this.toggle();
    }

    private handleKeydown(event: KeyboardEvent) {
        if (this.hasAttribute('disabled')) return;

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            this.toggle();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────

    /** Переключить состояние */
    public toggle() {
        // Clear indeterminate on toggle
        if (this.hasAttribute('indeterminate')) {
            this.removeAttribute('indeterminate');
        }

        if (this.hasAttribute('checked')) {
            this.removeAttribute('checked');
        } else {
            this.setAttribute('checked', '');
        }

        this.dispatchEvent(new CustomEvent('checkbox-change', {
            detail: { checked: this.isChecked(), value: this.getValue() },
            bubbles: true,
            cancelable: true
        }));
    }

    /** Установить состояние */
    public setChecked(checked: boolean) {
        if (checked) {
            this.setAttribute('checked', '');
        } else {
            this.removeAttribute('checked');
        }
        this.removeAttribute('indeterminate');
    }

    /** Получить состояние */
    public isChecked(): boolean {
        return this.hasAttribute('checked');
    }

    /** Получить значение (атрибут value или 'on') */
    public getValue(): string {
        return this.getAttribute('value') || 'on';
    }

    /** Установить значение */
    public setValue(val: string) {
        this.setAttribute('value', val);
    }

    /** Установить indeterminate */
    public setIndeterminate(indeterminate: boolean) {
        if (indeterminate) {
            this.setAttribute('indeterminate', '');
        } else {
            this.removeAttribute('indeterminate');
        }
    }

    /** Включить */
    public enable() {
        this.removeAttribute('disabled');
    }

    /** Отключить */
    public disable() {
        this.setAttribute('disabled', '');
    }

    /** Установить цвет */
    public setColor(color: 'primary' | 'secondary' | 'tertiary' | 'additional' | 'success' | 'warning' | 'error' | 'info') {
        this.setAttribute('color', color);
    }

    /** Установить размер */
    public setSize(size: 'small' | 'medium' | 'large') {
        this.setAttribute('size', size);
    }

    /** Фокус */
    public focus() {
        super.focus();
    }

    /** Снять фокус */
    public blur() {
        super.blur();
    }
}
