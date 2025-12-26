var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent, Attribute } from "@Purper";
let ReCheckbox = class ReCheckbox extends Component {
    box;
    labelEl;
    checked = new Attribute(this, 'checked');
    indeterminate = new Attribute(this, 'indeterminate');
    disabled = new Attribute(this, 'disabled');
    color = new Attribute(this, 'color');
    size = new Attribute(this, 'size');
    label = new Attribute(this, 'label');
    name = new Attribute(this, 'name');
    mini = new Attribute(this, 'mini');
    async preLoad(holder) {
        this.labelEl.textContent = this.label.value;
        this.label.subscribe((name, oldValue, newValue) => this.labelEl.textContent = newValue);
        this.addEventListener('click', this.handleClick.bind(this));
    }
    handleClick(event) {
        if (this.disabled.value) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        if (this.indeterminate.value)
            this.indeterminate.value = false;
        this.checked.value = !this.checked.value;
    }
};
ReCheckbox = __decorate([
    ReComponent({
        markupURL: "./src/components/ReCheckbox.hmle",
        cssURL: "./src/components/ReCheckbox.html.css",
        jsURL: "./src/components/ReCheckbox.html.ts",
    }, "re-checkbox")
], ReCheckbox);
export default ReCheckbox;
//# sourceMappingURL=ReCheckbox.html.js.map