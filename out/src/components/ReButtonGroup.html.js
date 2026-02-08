var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent, Attribute } from "@Purper";
let ReButtonGroup = class ReButtonGroup extends Component {
    container;
    buttonMap = new Map();
    Orientation = new Attribute(this, 'orientation', 'horizontal');
    Variant = new Attribute(this, 'variant', 'filled');
    Color = new Attribute(this, 'color', 'primary');
    Size = new Attribute(this, 'size', 'medium');
    Selection = new Attribute(this, 'selection', 'none');
    Value = new Attribute(this, 'value', null);
    Disabled = new Attribute(this, 'disabled', false);
    FullWidth = new Attribute(this, 'full-width', false);
    Mini = new Attribute(this, 'mini', false);
    async preLoad(holder) {
        this.update();
        this.initButtonMap();
    }
    update() {
        this.updateGroup();
        this.collectButtons();
        this.initButtonMap();
    }
    collectButtons() {
        this.buttonMap.forEach((selected, btn) => {
            btn.removeEventListener('click', this.handleButtonClick);
        });
        this.buttonMap = new Map();
        Array.from(this.querySelectorAll('re-button')).forEach((btn) => {
            this.buttonMap.set(btn, false);
        });
        this.buttonMap.forEach((selected, btn) => {
            btn.addEventListener('click', this.handleButtonClick);
        });
    }
    handleButtonClick = (event) => {
        const button = event.currentTarget;
        if (this.Selection.value === 'none')
            return;
        if (this.Selection.value === 'single') {
            this.buttonMap.forEach((selected, btn) => this.buttonMap.set(btn, false));
            this.buttonMap.set(button, true);
        }
        else if (this.Selection.value === 'multiple') {
            this.buttonMap.set(button, !this.buttonMap.get(button));
        }
        const transaction = this.Value.transaction();
        transaction.setObject('');
        this.buttonMap.forEach((selected, btn) => {
            if (selected)
                transaction.updateObject(master => master + (master ? ',' : '') + btn.OptionalValue.value);
        });
        transaction.commit();
        // Эмитируем событие изменения
        this.dispatchEvent(new CustomEvent('selection-change', {
            detail: {
                value: this.Value.value,
                buttons: this.buttonMap
            },
            bubbles: true,
            cancelable: true
        }));
    };
    updateGroup() {
        this.buttonMap.forEach((bool, btn) => {
            // Добавляем классы позиции для скруглений
            btn.classList.remove('group-first', 'group-middle', 'group-last', 'group-single');
            const index = Array.from(this.buttonMap.keys()).indexOf(btn);
            if (this.buttonMap.size === 1) {
                btn.classList.add('group-single');
            }
            else if (index === 0) {
                btn.classList.add('group-first');
            }
            else if (index === this.buttonMap.size - 1) {
                btn.classList.add('group-last');
            }
            else {
                btn.classList.add('group-middle');
            }
        });
    }
    initButtonMap() {
        if (this.Value.isExist()) {
            const selected = this.getValueSeparated();
            this.buttonMap.forEach((bool, btn) => {
                if (selected.indexOf(btn.OptionalValue.value) !== -1) {
                    this.buttonMap.set(btn, true);
                }
                else {
                    this.buttonMap.set(btn, false);
                }
            });
        }
        /*this.dispatchEvent(new CustomEvent('selection-change', {
            detail: {
                value: this.Value.value,
                buttons: this.buttonMap
            },
            bubbles: true,
            cancelable: true
        }));*/
    }
    getValueSeparated() {
        return this.Value.value ? this.Value.value.split(',') : [];
    }
};
ReButtonGroup = __decorate([
    ReComponent({
        markupURL: "./src/components/ReButtonGroup.hmle",
        cssURL: "./src/components/ReButtonGroup.html.css",
        ltCssURL: "./src/components/ReButtonGroup.html.lt.css",
        jsURL: "./src/components/ReButtonGroup.html.js",
    }, "re-button-group")
], ReButtonGroup);
export default ReButtonGroup;
//# sourceMappingURL=ReButtonGroup.html.js.map