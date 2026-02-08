var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Page, RePage, Observable } from "@Purper";
// Component Registry - easily extensible without hardcoding in HTML
const COMPONENT_REGISTRY = [
    {
        tag: 're-button',
        name: 'ReButton',
        description: 'Кнопка с различными вариантами, цветами и размерами',
        category: 'Inputs',
        defaultContent: 'Click me',
        props: [
            {
                name: 'variant',
                type: 'select',
                options: ['filled', 'outlined', 'text'],
                default: 'filled',
                description: 'Визуальный стиль кнопки'
            },
            {
                name: 'color',
                type: 'select',
                options: ['primary', 'secondary', 'tertiary', 'additional', 'success', 'warning', 'error', 'info', 'empty'],
                default: 'primary',
                description: 'Цветовая схема'
            },
            {
                name: 'size',
                type: 'select',
                options: ['extra-small', 'small', 'medium', 'large', 'extra-large'],
                default: 'medium',
                description: 'Размер кнопки'
            },
            {
                name: 'icon',
                type: 'text',
                default: '',
                description: 'Имя Material Icon'
            },
            {
                name: 'disabled',
                type: 'boolean',
                default: false,
                description: 'Отключить кнопку'
            },
            {
                name: 'mini',
                type: 'boolean',
                default: false,
                description: 'Компактный режим'
            },
            {
                name: 'href',
                type: 'text',
                default: '',
                description: 'URL для навигации'
            }
        ]
    },
    {
        tag: 're-chip',
        name: 'ReChip',
        description: 'Компактный элемент для отображения информации',
        category: 'Display',
        defaultContent: 'Chip',
        props: [
            {
                name: 'variant',
                type: 'select',
                options: ['filled', 'outlined'],
                default: 'filled',
                description: 'Визуальный стиль'
            },
            {
                name: 'color',
                type: 'select',
                options: ['primary', 'secondary', 'tertiary', 'additional', 'success', 'warning', 'error', 'info', 'empty'],
                default: 'primary',
                description: 'Цветовая схема'
            },
            {
                name: 'size',
                type: 'select',
                options: ['extra-small', 'small', 'medium', 'large', 'extra-large'],
                default: 'medium',
                description: 'Размер'
            },
            {
                name: 'icon',
                type: 'text',
                default: '',
                description: 'Имя Material Icon'
            },
            {
                name: 'disabled',
                type: 'boolean',
                default: false,
                description: 'Отключить'
            }
        ]
    },
    {
        tag: 're-icon',
        name: 'ReIcon',
        description: 'Material Design иконка с настраиваемыми параметрами',
        category: 'Display',
        props: [
            {
                name: 'icon',
                type: 'text',
                default: 'star',
                description: 'Имя Material Icon'
            },
            {
                name: 'variant',
                type: 'select',
                options: ['filled', 'outlined', 'rounded', 'sharp'],
                default: 'filled',
                description: 'Стиль иконки'
            },
            {
                name: 'color',
                type: 'select',
                options: ['primary', 'secondary', 'tertiary', 'additional', 'success', 'warning', 'error', 'info', 'empty', 'inherit'],
                default: 'inherit',
                description: 'Цвет'
            },
            {
                name: 'size',
                type: 'select',
                options: ['extra-small', 'small', 'medium', 'large', 'extra-large'],
                default: 'medium',
                description: 'Размер'
            },
            {
                name: 'weight',
                type: 'select',
                options: ['100', '200', '300', '400', '500', '600', '700'],
                default: '400',
                description: 'Толщина'
            },
            {
                name: 'animation',
                type: 'select',
                options: ['none', 'spin', 'pulse', 'bounce', 'shake'],
                default: 'none',
                description: 'Анимация'
            }
        ]
    },
    {
        tag: 're-checkbox',
        name: 'ReCheckbox',
        description: 'Чекбокс с поддержкой различных состояний',
        category: 'Inputs',
        props: [
            {
                name: 'checked',
                type: 'boolean',
                default: false,
                description: 'Отмечен'
            },
            {
                name: 'indeterminate',
                type: 'boolean',
                default: false,
                description: 'Неопределённое состояние'
            },
            {
                name: 'disabled',
                type: 'boolean',
                default: false,
                description: 'Отключён'
            },
            {
                name: 'color',
                type: 'select',
                options: ['primary', 'secondary', 'tertiary', 'success', 'warning', 'error', 'info'],
                default: 'primary',
                description: 'Цвет'
            },
            {
                name: 'size',
                type: 'select',
                options: ['small', 'medium', 'large'],
                default: 'medium',
                description: 'Размер'
            },
            {
                name: 'label',
                type: 'text',
                default: '',
                description: 'Текст метки'
            }
        ]
    },
    {
        tag: 're-input',
        name: 'ReInput',
        description: 'Поле ввода с валидацией и различными типами',
        category: 'Inputs',
        props: [
            {
                name: 'type',
                type: 'select',
                options: ['text', 'number', 'email', 'password'],
                default: 'text',
                description: 'Тип ввода'
            },
            {
                name: 'variant',
                type: 'select',
                options: ['filled', 'outlined', 'text'],
                default: 'filled',
                description: 'Визуальный стиль'
            },
            {
                name: 'color',
                type: 'select',
                options: ['primary', 'secondary', 'tertiary', 'success', 'warning', 'error', 'info'],
                default: 'primary',
                description: 'Цвет'
            },
            {
                name: 'placeholder',
                type: 'text',
                default: 'Введите текст...',
                description: 'Placeholder текст'
            },
            {
                name: 'value',
                type: 'text',
                default: '',
                description: 'Значение'
            },
            {
                name: 'disabled',
                type: 'boolean',
                default: false,
                description: 'Отключён'
            },
            {
                name: 'required',
                type: 'boolean',
                default: false,
                description: 'Обязательное поле'
            }
        ]
    },
    {
        tag: 're-button-group',
        name: 'ReButtonGroup',
        description: 'Группа кнопок с возможностью выбора',
        category: 'Inputs',
        defaultContent: '<re-button>One</re-button><re-button>Two</re-button><re-button>Three</re-button>',
        props: [
            {
                name: 'orientation',
                type: 'select',
                options: ['horizontal', 'vertical', 'flex'],
                default: 'horizontal',
                description: 'Ориентация'
            },
            {
                name: 'variant',
                type: 'select',
                options: ['filled', 'outlined', 'text'],
                default: 'filled',
                description: 'Стиль кнопок'
            },
            {
                name: 'color',
                type: 'select',
                options: ['primary', 'secondary', 'tertiary', 'success', 'warning', 'error', 'info'],
                default: 'primary',
                description: 'Цвет'
            },
            {
                name: 'size',
                type: 'select',
                options: ['small', 'medium', 'large'],
                default: 'medium',
                description: 'Размер'
            },
            {
                name: 'selection',
                type: 'select',
                options: ['none', 'single', 'multiple'],
                default: 'none',
                description: 'Режим выбора'
            },
            {
                name: 'disabled',
                type: 'boolean',
                default: false,
                description: 'Отключена'
            }
        ]
    },
    {
        tag: 'paper-component',
        name: 'PaperComponent',
        description: 'Контейнер-карточка с тенью и стилизацией',
        category: 'Layout',
        defaultContent: 'Paper content',
        props: [
            {
                name: 'color',
                type: 'select',
                options: ['primary', 'secondary', 'tertiary', 'additional', 'success', 'warning', 'error', 'info'],
                default: 'primary',
                description: 'Цвет акцента'
            },
            {
                name: 'interactive',
                type: 'boolean',
                default: false,
                description: 'Интерактивный (hover эффект)'
            },
            {
                name: 'alternate',
                type: 'boolean',
                default: false,
                description: 'Альтернативный стиль'
            }
        ]
    }
];
let ComponentPlaygroundPage = class ComponentPlaygroundPage extends Page {
    componentSelect;
    propsContainer;
    previewContainer;
    codeOutput;
    contentInput;
    componentInfo;
    historyContainer;
    resetBtn;
    copyCodeBtn;
    bgOptions;
    // Observables for template bindings
    hidePropsPanel = new Observable(true);
    hasComponent = new Observable(false);
    previewBg = new Observable('light');
    currentComponent = null;
    currentProps = new Map();
    history = [];
    async preLoad(holder) {
        // Event listeners
        this.componentSelect.addEventListener('change', () => this.onComponentChange());
        this.contentInput.addEventListener('input', () => this.updatePreview());
        this.resetBtn.addEventListener('click', () => this.resetPlayground());
        this.copyCodeBtn.addEventListener('click', () => this.copyCode());
        // Populate component selector
        this.populateComponentSelector();
        // Background options
        this.bgOptions.querySelectorAll('.bg-option').forEach(opt => {
            opt.addEventListener('click', () => this.changeBackground(opt));
        });
    }
    populateComponentSelector() {
        // Group by category
        const categories = new Map();
        COMPONENT_REGISTRY.forEach(comp => {
            const list = categories.get(comp.category) || [];
            list.push(comp);
            categories.set(comp.category, list);
        });
        // Create optgroups
        categories.forEach((components, category) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category;
            components.forEach(comp => {
                const option = document.createElement('option');
                option.value = comp.tag;
                option.textContent = `<${comp.tag}> - ${comp.name}`;
                optgroup.appendChild(option);
            });
            this.componentSelect.appendChild(optgroup);
        });
    }
    onComponentChange() {
        const selectedTag = this.componentSelect.value;
        if (!selectedTag) {
            this.showPlaceholder();
            return;
        }
        const component = COMPONENT_REGISTRY.find(c => c.tag === selectedTag);
        if (!component)
            return;
        this.currentComponent = component;
        this.currentProps.clear();
        // Update observables
        this.hidePropsPanel.setObject(false);
        this.hasComponent.setObject(true);
        // Set defaults
        component.props.forEach(prop => {
            if (prop.default !== undefined) {
                this.currentProps.set(prop.name, prop.default);
            }
        });
        // Update content input
        this.contentInput.value = component.defaultContent || '';
        // Render UI
        this.renderPropsPanel();
        this.renderComponentInfo();
        this.updatePreview();
    }
    renderPropsPanel() {
        if (!this.currentComponent)
            return;
        this.propsContainer.innerHTML = '';
        this.currentComponent.props.forEach(prop => {
            const row = document.createElement('div');
            row.className = 'prop-row';
            const label = document.createElement('label');
            label.className = 'prop-label';
            label.innerHTML = `<code>${prop.name}</code> ${prop.description || ''}`;
            row.appendChild(label);
            if (prop.type === 'select') {
                const select = document.createElement('select');
                select.className = 'prop-select';
                select.dataset.prop = prop.name;
                prop.options?.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    if (this.currentProps.get(prop.name) === opt) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
                select.addEventListener('change', () => {
                    this.currentProps.set(prop.name, select.value);
                    this.updatePreview();
                });
                row.appendChild(select);
            }
            else if (prop.type === 'boolean') {
                const wrapper = document.createElement('div');
                wrapper.className = 'prop-checkbox-wrapper';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'prop-checkbox';
                checkbox.dataset.prop = prop.name;
                checkbox.checked = this.currentProps.get(prop.name) === true;
                checkbox.addEventListener('change', () => {
                    this.currentProps.set(prop.name, checkbox.checked);
                    this.updatePreview();
                });
                const checkLabel = document.createElement('span');
                checkLabel.textContent = checkbox.checked ? 'Включено' : 'Выключено';
                checkbox.addEventListener('change', () => {
                    checkLabel.textContent = checkbox.checked ? 'Включено' : 'Выключено';
                });
                wrapper.appendChild(checkbox);
                wrapper.appendChild(checkLabel);
                row.appendChild(wrapper);
            }
            else if (prop.type === 'text') {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'prop-input';
                input.dataset.prop = prop.name;
                input.value = String(this.currentProps.get(prop.name) || '');
                input.placeholder = prop.description || '';
                input.addEventListener('input', () => {
                    this.currentProps.set(prop.name, input.value);
                    this.updatePreview();
                });
                row.appendChild(input);
            }
            else if (prop.type === 'number') {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'prop-input';
                input.dataset.prop = prop.name;
                input.value = String(this.currentProps.get(prop.name) || 0);
                input.addEventListener('input', () => {
                    this.currentProps.set(prop.name, input.value);
                    this.updatePreview();
                });
                row.appendChild(input);
            }
            this.propsContainer.appendChild(row);
        });
    }
    renderComponentInfo() {
        if (!this.currentComponent)
            return;
        this.componentInfo.innerHTML = `
            <div class="info-item">
                <span class="info-key">Компонент</span>
                <span class="info-value">${this.currentComponent.name}</span>
            </div>
            <div class="info-item">
                <span class="info-key">Тег</span>
                <span class="info-value"><code>&lt;${this.currentComponent.tag}&gt;</code></span>
            </div>
            <div class="info-item">
                <span class="info-key">Категория</span>
                <span class="info-value">${this.currentComponent.category}</span>
            </div>
            <div class="info-item">
                <span class="info-key">Описание</span>
                <span class="info-value">${this.currentComponent.description}</span>
            </div>
            <div class="info-item">
                <span class="info-key">Свойства</span>
                <span class="info-value">${this.currentComponent.props.length} параметров</span>
            </div>
        `;
    }
    updatePreview() {
        if (!this.currentComponent)
            return;
        const tag = this.currentComponent.tag;
        const content = this.contentInput.value || this.currentComponent.defaultContent || '';
        // Build attributes string
        const attrs = [];
        this.currentProps.forEach((value, key) => {
            const propMeta = this.currentComponent.props.find(p => p.name === key);
            if (!propMeta)
                return;
            // Skip default values to keep code clean
            if (value === propMeta.default)
                return;
            // Skip empty strings
            if (value === '')
                return;
            if (typeof value === 'boolean') {
                if (value) {
                    attrs.push(key);
                }
            }
            else {
                attrs.push(`${key}="${value}"`);
            }
        });
        const attrString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
        const code = `<${tag}${attrString}>${content}</${tag}>`;
        // Update preview
        this.previewContainer.innerHTML = code;
        // Update code output with syntax highlighting
        this.codeOutput.innerHTML = `<code>${this.highlightCode(code)}</code>`;
        // Add to history
        this.addToHistory(code);
    }
    highlightCode(code) {
        return code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="tag">$2</span>')
            .replace(/([\w-]+)(=)/g, '<span class="attr-name">$1</span>$2')
            .replace(/(".*?")/g, '<span class="attr-value">$1</span>');
    }
    addToHistory(code) {
        if (!this.currentComponent)
            return;
        // Avoid duplicates
        if (this.history.length > 0 && this.history[0].code === code)
            return;
        this.history.unshift({
            time: new Date(),
            code,
            component: this.currentComponent.name
        });
        // Keep only last 10
        if (this.history.length > 10) {
            this.history.pop();
        }
        this.renderHistory();
    }
    renderHistory() {
        if (this.history.length === 0) {
            this.historyContainer.innerHTML = '<p class="placeholder-text">История пуста</p>';
            return;
        }
        this.historyContainer.innerHTML = this.history.map((item, idx) => {
            const timeStr = item.time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return `
                <div class="history-item" data-idx="${idx}">
                    <span class="history-time">${timeStr}</span>
                    <span>${item.component}</span>
                </div>
            `;
        }).join('');
        // Click to restore
        this.historyContainer.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.idx || '0');
                const item = this.history[idx];
                if (item) {
                    this.previewContainer.innerHTML = item.code;
                    this.codeOutput.innerHTML = `<code>${this.highlightCode(item.code)}</code>`;
                }
            });
        });
    }
    showPlaceholder() {
        this.currentComponent = null;
        this.currentProps.clear();
        // Update observables
        this.hidePropsPanel.setObject(true);
        this.hasComponent.setObject(false);
        this.propsContainer.innerHTML = '<p class="placeholder-text">Выберите компонент для настройки свойств</p>';
        this.previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <re-icon icon="touch_app" size="extra-large" color="secondary"></re-icon>
                <p>Выберите компонент для предпросмотра</p>
            </div>
        `;
        this.codeOutput.innerHTML = '<code>&lt;!-- Код появится здесь --&gt;</code>';
        this.componentInfo.innerHTML = '<p class="placeholder-text">Информация о компоненте</p>';
    }
    resetPlayground() {
        if (this.currentComponent) {
            // Reset to defaults
            this.currentProps.clear();
            this.currentComponent.props.forEach(prop => {
                if (prop.default !== undefined) {
                    this.currentProps.set(prop.name, prop.default);
                }
            });
            this.contentInput.value = this.currentComponent.defaultContent || '';
            this.renderPropsPanel();
            this.updatePreview();
        }
    }
    async copyCode() {
        const code = this.codeOutput.textContent || '';
        try {
            await navigator.clipboard.writeText(code);
            // Visual feedback
            const originalIcon = this.copyCodeBtn.getAttribute('icon');
            this.copyCodeBtn.setAttribute('icon', 'check');
            setTimeout(() => {
                this.copyCodeBtn.setAttribute('icon', originalIcon || 'content_copy');
            }, 1500);
        }
        catch (err) {
            console.error('Failed to copy:', err);
        }
    }
    changeBackground(option) {
        const bg = option.dataset.bg;
        if (!bg)
            return;
        // Update active state
        this.bgOptions.querySelectorAll('.bg-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        // Update observable for data-bg attribute binding
        this.previewBg.setObject(bg);
    }
};
ComponentPlaygroundPage = __decorate([
    RePage({
        markupURL: "./src/pages/ComponentPlaygroundPage.hmle",
        cssURL: "../../out/src/pages/ComponentPlaygroundPage.html.css",
        jsURL: "./src/pages/ComponentPlaygroundPage.html.ts",
    }, "/playground")
], ComponentPlaygroundPage);
export default ComponentPlaygroundPage;
//# sourceMappingURL=ComponentPlaygroundPage.html.js.map