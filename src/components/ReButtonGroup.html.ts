import { IElementHolder, Component, ReComponent, TemplateHolder, Attribute } from "@Purper";
import ReButton from "./ReButton.html.js";

@ReComponent({
    markupURL: "./src/components/ReButtonGroup.hmle",
    cssURL: "./src/components/ReButtonGroup.html.css",
    ltCssURL: "./src/components/ReButtonGroup.html.lt.css",
    jsURL: "./src/components/ReButtonGroup.html.js",
}, "re-button-group")
export default class ReButtonGroup extends Component {
    private container?: HTMLDivElement;
    public buttonMap: Map<ReButton, boolean> = new Map<ReButton, boolean>();

    public readonly Orientation: Attribute<"horizontal" | "vertical" | "flex"> = new Attribute(this, 'orientation', 'horizontal');
    public readonly Variant: Attribute<"filled" | "outlined" | "text" | null> = new Attribute(this, 'variant', 'filled');
    public readonly Color: Attribute<string> = new Attribute(this, 'color', 'primary');
    public readonly Size: Attribute<string> = new Attribute(this, 'size', 'medium');
    public readonly Selection: Attribute<"single" | "multiple" | "none"> = new Attribute(this, 'selection', 'none')
    public readonly Value: Attribute<string | null> = new Attribute(this, 'value', null);
    public readonly Disabled: Attribute<boolean> = new Attribute(this, 'disabled', false);
    public readonly FullWidth: Attribute<boolean> = new Attribute(this, 'full-width', false)
    public readonly Mini: Attribute<boolean> = new Attribute(this, 'mini', false)

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        this.update();
        this.initButtonMap();
    }
    private update() {
        this.updateGroup();
        this.collectButtons();
        this.initButtonMap();
    }
    private collectButtons() {
        this.buttonMap.forEach((selected, btn) => {
            btn.removeEventListener('click', this.handleButtonClick);
        });

        this.buttonMap = new Map<ReButton, boolean>();
        Array.from(this.querySelectorAll('re-button')).forEach((btn) => {
            this.buttonMap.set(btn as ReButton, false);
        });

        this.buttonMap.forEach((selected, btn) => {
            btn.addEventListener('click', this.handleButtonClick);
        });
    }
    private handleButtonClick = (event: Event) => {
        const button = event.currentTarget as ReButton;

        if (this.Selection.value === 'none') return;

        if (this.Selection.value === 'single') {
            this.buttonMap.forEach((selected, btn) => this.buttonMap.set(btn, false));
            this.buttonMap.set(button, true);
        } else if (this.Selection.value === 'multiple') {
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
    private updateGroup() {
        this.buttonMap.forEach((bool, btn) => {
            // Добавляем классы позиции для скруглений
            btn.classList.remove('group-first', 'group-middle', 'group-last', 'group-single');
            const index = Array.from(this.buttonMap.keys()).indexOf(btn);

            if (this.buttonMap.size === 1) {
                btn.classList.add('group-single');
            } else if (index === 0) {
                btn.classList.add('group-first');
            } else if (index === this.buttonMap.size - 1) {
                btn.classList.add('group-last');
            } else {
                btn.classList.add('group-middle');
            }
        });
    }
    private initButtonMap() {
        if (this.Value.isExist()) {
            const selected = this.getValueSeparated();
            this.buttonMap.forEach((bool, btn) => {
                if (selected.indexOf(btn.OptionalValue.value) !== -1) {
                    this.buttonMap.set(btn, true);
                } else {
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
    public getValueSeparated(): string[] {
        return this.Value.value ? this.Value.value.split(',') : [];
    }

}
