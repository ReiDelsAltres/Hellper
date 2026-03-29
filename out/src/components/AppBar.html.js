var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReComponent, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
let AppBar = class AppBar extends ComponentCore {
    Type = new Attribute(this, "type", null);
    Pos = new Attribute(this, "pos", "vertical");
    Hidden = new Attribute(this, "hidden", null);
    NoHover = new Attribute(this, "no-hover", null);
    async preLoad(holder) {
        this.notifyAllChildren((el) => {
            el.setAttribute("mini", "");
        });
        this.Hidden.subscribe((val) => {
            this.notifyAllChildren((el) => {
                if (val !== null)
                    el.removeAttribute("mini");
                else
                    el.setAttribute("mini", "");
            });
        });
        const root = this.shadowRoot || this;
        root.addEventListener("slotchange", () => {
            this.notifyAllChildren((el) => {
                if (this.Hidden.value !== null)
                    el.removeAttribute("mini");
                else
                    el.setAttribute("mini", "");
            });
        });
    }
    notifyAllChildren(not) {
        const root = this.shadowRoot || this;
        root.querySelectorAll("slot").forEach(slt => {
            slt.assignedElements({ flatten: true }).forEach(not);
        });
    }
};
AppBar = __decorate([
    ReComponent({
        markupURL: "./src/components/AppBar.hmle",
        cssURL: "../../out/src/components/AppBar.html.css",
        jsURL: "./src/components/AppBar.html.js"
    }, "app-bar")
], AppBar);
export default AppBar;
//# sourceMappingURL=AppBar.html.js.map