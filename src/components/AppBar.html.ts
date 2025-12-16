import { AccessType, Component, IElementHolder, ReComponent } from "@Purper";

@ReComponent({
    markupURL: "./src/components/AppBar.html",
    cssURL: "./src/components/AppBar.html.css",
    jsURL: "./src/components/AppBar.html.js",
    class: AppBar,
}, "app-bar")
export default class AppBar extends Component {
    static get observedAttributes() {
        return ["type", "pos", "hidden"];
    }
    private _type: "mini" | "full" = "full";
    private _orientation: "vertical" | "horizontal" = "vertical";
    private _hidden: boolean = false;
    private _noHover: boolean = false;

    public get type(): "mini" | "full" {
        return this._type;
    }
    public get orientation(): "vertical" | "horizontal" {
        return this._orientation;
    }
    public get hidden(): boolean {
        return this._hidden;
    }
    public get noHover(): boolean {
        return this._noHover;
    }

    protected async preLoad(holder: IElementHolder): Promise<void> {
        // Ensure children reflect current type on initial load
        this.notifyAllChildren((el) => {
            el.setAttribute("mini", "");
        }, this);
    }

    public set type(value: "mini" | "full") {
        if (this._type === value) return;

        if (value === "full") this.removeAttribute("type");
        else this.setAttribute("type", "mini");

        this._type = value;
    }
    public set orientation(value: "vertical" | "horizontal") {
        this._orientation = value;

        if (value === "vertical") this.removeAttribute("orientation");
        else this.setAttribute("orientation", "horizontal");
    }
    public set hidden(value: boolean) {
        this._hidden = value;

        if (value === false) this.removeAttribute("hidden");
        else this.setAttribute("hidden", "");

        this.notifyAllChildren((el) => {
            if (value === true) el.removeAttribute("mini");
            else el.setAttribute("mini", "");
        }, this);
    }
    public set noHover(value: boolean) {
        this._noHover = value;
    }

    public notifyAllChildren(not: (element: Element) => void,
        holder: Element | DocumentFragment = this as unknown as Element) {
            (holder as any).querySelectorAll("slot").forEach(slt => {
                slt.assignedElements({ flatten: true }).forEach(not);
            });
            //holder.querySelectorAll("*").forEach(not);
    }
}