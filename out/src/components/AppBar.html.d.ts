import { Component, IElementHolder } from "@Purper";
export default class AppBar extends Component {
    static get observedAttributes(): string[];
    private _type;
    private _orientation;
    private _hidden;
    private _noHover;
    get type(): "mini" | "full";
    get orientation(): "vertical" | "horizontal";
    get hidden(): boolean;
    get noHover(): boolean;
    protected preLoad(holder: IElementHolder): Promise<void>;
    set type(value: "mini" | "full");
    set orientation(value: "vertical" | "horizontal");
    set hidden(value: boolean);
    set noHover(value: boolean);
    notifyAllChildren(not: (element: Element) => void, holder?: Element | DocumentFragment): void;
}
//# sourceMappingURL=AppBar.html.d.ts.map