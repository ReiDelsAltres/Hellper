import { IElementHolder, Component, ReComponent } from "@Purper";
import ReButton from "./ReButton.html.js";

@ReComponent({
    markupURL: "./src/components/ReButtonGroup.html",
    cssURL: "./src/components/ReButtonGroup.html.css",
    jsURL: "./src/components/ReButtonGroup.html.js",
    class: ReButtonGroup,
}, "re-button-group")
export default class ReButtonGroup extends Component {
    private container?: HTMLElement;
    private buttons: ReButton[] = [];

    static get observedAttributes() {
        return [
            'orientation',   // 'horizontal' | 'vertical'
            'variant',       // 'filled' | 'outlined' | 'text'
            'color',         // цвет для всех кнопок
            'size',          // размер для всех кнопок
            'selection',     // 'single' | 'multiple' | 'none'
            'value',         // текущее выбранное значение (или JSON массив для multiple)
            'disabled',      // отключить всю группу
            'full-width',    // растянуть на всю ширину
            'mini'           // компактный режим
        ];
    }

    protected preLoad(holder: IElementHolder): Promise<void> {
        this.container = holder.element.querySelector('.button-group-container') as HTMLElement;

        // Собираем все re-button из slot
        this.collectButtons();

        // Следим за изменениями slot
        const slot = holder.element.querySelector('slot');
        if (slot) {
            slot.addEventListener('slotchange', () => {
                this.collectButtons();
                this.updateGroup();
            });
        }

        // Начальное обновление
        this.updateGroup();

        // Обработка изменений атрибутов
        this.onAttributeChangedCallback((name, oldValue, newValue) => {
            this.updateGroup();
        });

        return Promise.resolve();
    }

    private collectButtons() {
        // Убираем старые слушатели
        this.buttons.forEach(btn => {
            btn.removeEventListener('click', this.handleButtonClick);
        });

        // Собираем новые кнопки
        this.buttons = Array.from(this.querySelectorAll('re-button')) as ReButton[];

        // Добавляем слушатели
        this.buttons.forEach(btn => {
            btn.addEventListener('click', this.handleButtonClick);
        });
    }

    private handleButtonClick = (event: Event) => {
        const button = event.currentTarget as ReButton;
        const selection = this.getAttribute('selection') || 'none';

        if (selection === 'none') return;

        const buttonValue = button.getAttribute('value') || button.textContent?.trim() || '';

        if (selection === 'single') {
            // Single selection - toggle only this button
            const wasSelected = button.hasAttribute('selected');
            
            // Убираем selected со всех кнопок
            this.buttons.forEach(btn => {
                btn.removeAttribute('selected');
            });

            // Если кнопка не была выбрана - выбираем её
            if (!wasSelected) {
                button.setAttribute('selected', '');
                this.setAttribute('value', buttonValue);
            } else {
                this.removeAttribute('value');
            }
        } else if (selection === 'multiple') {
            // Multiple selection - toggle this button
            if (button.hasAttribute('selected')) {
                button.removeAttribute('selected');
            } else {
                button.setAttribute('selected', '');
            }

            // Обновляем value как JSON массив
            const selectedValues = this.buttons
                .filter(btn => btn.hasAttribute('selected'))
                .map(btn => btn.getAttribute('value') || btn.textContent?.trim() || '');
            
            this.setAttribute('value', JSON.stringify(selectedValues));
        }

        // Эмитируем событие изменения
        this.dispatchEvent(new CustomEvent('selection-change', {
            detail: {
                value: this.getValue(),
                selectedButtons: this.getSelectedButtons()
            },
            bubbles: true,
            cancelable: true
        }));
    };

    private updateGroup() {
        const orientation = this.getAttribute('orientation') || 'horizontal';
        const variant = this.getAttribute('variant');
        const color = this.getAttribute('color');
        const size = this.getAttribute('size');
        const disabled = this.hasAttribute('disabled');
        const mini = this.hasAttribute('mini');

        // Применяем атрибуты к кнопкам
        this.buttons.forEach((btn, index) => {
            // Передаём общие атрибуты, если у кнопки нет своих
            if (variant && !btn.hasAttribute('variant')) {
                btn.setAttribute('variant', variant);
            }
            if (color && !btn.hasAttribute('color')) {
                btn.setAttribute('color', color);
            }
            if (size && !btn.hasAttribute('size')) {
                btn.setAttribute('size', size);
            }
            if (disabled) {
                btn.setAttribute('disabled', '');
            }
            if (mini) {
                btn.setAttribute('mini', '');
            }

            // Добавляем классы позиции для скруглений
            btn.classList.remove('group-first', 'group-middle', 'group-last', 'group-single');
            
            if (this.buttons.length === 1) {
                btn.classList.add('group-single');
            } else if (index === 0) {
                btn.classList.add('group-first');
            } else if (index === this.buttons.length - 1) {
                btn.classList.add('group-last');
            } else {
                btn.classList.add('group-middle');
            }
        });

        // Устанавливаем начальные selected на основе value
        this.syncSelectionFromValue();
    }

    private syncSelectionFromValue() {
        const selection = this.getAttribute('selection') || 'none';
        const value = this.getAttribute('value');

        if (selection === 'none' || !value) return;

        if (selection === 'single') {
            this.buttons.forEach(btn => {
                const btnValue = btn.getAttribute('value') || btn.textContent?.trim() || '';
                if (btnValue === value) {
                    btn.setAttribute('selected', '');
                } else {
                    btn.removeAttribute('selected');
                }
            });
        } else if (selection === 'multiple') {
            try {
                const values = JSON.parse(value) as string[];
                this.buttons.forEach(btn => {
                    const btnValue = btn.getAttribute('value') || btn.textContent?.trim() || '';
                    if (values.includes(btnValue)) {
                        btn.setAttribute('selected', '');
                    } else {
                        btn.removeAttribute('selected');
                    }
                });
            } catch {
                // Если не JSON, пробуем как одно значение
                this.buttons.forEach(btn => {
                    const btnValue = btn.getAttribute('value') || btn.textContent?.trim() || '';
                    if (btnValue === value) {
                        btn.setAttribute('selected', '');
                    } else {
                        btn.removeAttribute('selected');
                    }
                });
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────

    /**
     * Получить текущее значение (или массив значений для multiple)
     */
    public getValue(): string | string[] | null {
        const selection = this.getAttribute('selection') || 'none';
        const value = this.getAttribute('value');

        if (selection === 'multiple' && value) {
            try {
                return JSON.parse(value) as string[];
            } catch {
                return value ? [value] : [];
            }
        }

        return value;
    }

    /**
     * Установить значение
     */
    public setValue(value: string | string[]) {
        if (Array.isArray(value)) {
            this.setAttribute('value', JSON.stringify(value));
        } else {
            this.setAttribute('value', value);
        }
        this.syncSelectionFromValue();
    }

    /**
     * Получить выбранные кнопки
     */
    public getSelectedButtons(): ReButton[] {
        return this.buttons.filter(btn => btn.hasAttribute('selected'));
    }

    /**
     * Очистить выбор
     */
    public clearSelection() {
        this.buttons.forEach(btn => btn.removeAttribute('selected'));
        this.removeAttribute('value');
        
        this.dispatchEvent(new CustomEvent('selection-change', {
            detail: { value: null, selectedButtons: [] },
            bubbles: true,
            cancelable: true
        }));
    }

    /**
     * Выбрать кнопку по индексу
     */
    public selectByIndex(index: number) {
        if (index < 0 || index >= this.buttons.length) return;

        const btn = this.buttons[index];
        const selection = this.getAttribute('selection') || 'none';

        if (selection === 'single') {
            this.buttons.forEach(b => b.removeAttribute('selected'));
            btn.setAttribute('selected', '');
            this.setAttribute('value', btn.getAttribute('value') || btn.textContent?.trim() || '');
        } else if (selection === 'multiple') {
            btn.setAttribute('selected', '');
            const selectedValues = this.buttons
                .filter(b => b.hasAttribute('selected'))
                .map(b => b.getAttribute('value') || b.textContent?.trim() || '');
            this.setAttribute('value', JSON.stringify(selectedValues));
        }
    }

    /**
     * Отключить группу
     */
    public disable() {
        this.setAttribute('disabled', '');
    }

    /**
     * Включить группу
     */
    public enable() {
        this.removeAttribute('disabled');
        this.buttons.forEach(btn => btn.removeAttribute('disabled'));
    }

    /**
     * Получить все кнопки в группе
     */
    public getButtons(): ReButton[] {
        return [...this.buttons];
    }
}
