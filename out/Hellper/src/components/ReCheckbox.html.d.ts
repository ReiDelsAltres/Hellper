import { IElementHolder, Component } from "@Purper";
import Attribute from './../../../Purper/src/foundation/component_api/Attribute';
export default class ReCheckbox extends Component {
    private box?;
    private labelEl?;
    checked: Attribute<boolean>;
    static get observedAttributes(): string[];
    protected preLoad(holder: IElementHolder): Promise<void>;
    private updateCheckbox;
    private handleClick;
    private handleKeydown;
    /** Переключить состояние */
    toggle(): void;
    /** Установить состояние */
    setChecked(checked: boolean): void;
    /** Получить состояние */
    isChecked(): boolean;
    /** Получить значение (атрибут value или 'on') */
    getValue(): boolean;
    /** Установить значение */
    setValue(val: string): void;
    /** Установить indeterminate */
    setIndeterminate(indeterminate: boolean): void;
    /** Включить */
    enable(): void;
    /** Отключить */
    disable(): void;
    /** Установить цвет */
    setColor(color: 'primary' | 'secondary' | 'tertiary' | 'additional' | 'success' | 'warning' | 'error' | 'info'): void;
    /** Установить размер */
    setSize(size: 'small' | 'medium' | 'large'): void;
    /** Фокус */
    focus(): void;
    /** Снять фокус */
    blur(): void;
}
//# sourceMappingURL=ReCheckbox.html.d.ts.map