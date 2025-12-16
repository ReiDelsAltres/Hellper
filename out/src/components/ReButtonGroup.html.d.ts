import { IElementHolder, Component } from "@Purper";
import ReButton from "./ReButton.html.js";
export default class ReButtonGroup extends Component {
    private container?;
    private buttons;
    static get observedAttributes(): string[];
    protected preLoad(holder: IElementHolder): Promise<void>;
    private collectButtons;
    private handleButtonClick;
    private updateGroup;
    private syncSelectionFromValue;
    /**
     * Получить текущее значение (или массив значений для multiple)
     */
    getValue(): string | string[] | null;
    /**
     * Установить значение
     */
    setValue(value: string | string[]): void;
    /**
     * Получить выбранные кнопки
     */
    getSelectedButtons(): ReButton[];
    /**
     * Очистить выбор
     */
    clearSelection(): void;
    /**
     * Выбрать кнопку по индексу
     */
    selectByIndex(index: number): void;
    /**
     * Отключить группу
     */
    disable(): void;
    /**
     * Включить группу
     */
    enable(): void;
    /**
     * Получить все кнопки в группе
     */
    getButtons(): ReButton[];
}
//# sourceMappingURL=ReButtonGroup.html.d.ts.map