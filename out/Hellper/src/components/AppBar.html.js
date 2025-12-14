var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AccessType, Component, ReComponent } from "@Purper";
let AppBar = class AppBar extends Component {
    static get observedAttributes() {
        return ["type", "pos", "hidden"];
    }
    _type = "full";
    _orientation = "vertical";
    _hidden = false;
    _noHover = false;
    get type() {
        return this._type;
    }
    get orientation() {
        return this._orientation;
    }
    get hidden() {
        return this._hidden;
    }
    get noHover() {
        return this._noHover;
    }
    async preLoad(holder) {
        this.notifyAllChildrenAboutType(holder.element, this.type);
    }
    set type(value) {
        if (value === "full")
            this.removeAttribute("type");
        else
            this.setAttribute("type", "mini");
        this.notifyAllChildren((el) => {
            if (this._type === value)
                return;
            if (value === "full")
                this.removeAttribute("mini");
            else
                this.setAttribute("mini", "");
        });
        this._type = value;
    }
    set orientation(value) {
        this._orientation = value;
        if (value === "vertical")
            this.removeAttribute("orientation");
        else
            this.setAttribute("orientation", "horizontal");
    }
    set hidden(value) {
        this._hidden = value;
        if (value === false)
            this.removeAttribute("hidden");
        else
            this.setAttribute("hidden", "");
    }
    set noHover(value) {
        this._noHover = value;
    }
    notifyAllChildren(not, holder = this) {
        holder.querySelectorAll("*").forEach(not);
    }
};
AppBar = __decorate([
    ReComponent("./src/components/AppBar.html", "./src/components/AppBar.html.css", "./src/components/AppBar.html.ts", AccessType.BOTH, "app-bar")
], AppBar);
export default AppBar;
//# sourceMappingURL=AppBar.html.js.map