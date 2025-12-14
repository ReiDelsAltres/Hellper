var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent } from "@Purper";
let ReChip = class ReChip extends Component {
    chip;
    iconSlot;
    removeSlot;
    static get observedAttributes() {
        return ['size', 'color', 'icon', 'disabled', 'interactive'];
    }
    preLoad(holder) {
        this.chip = holder.element.querySelector('.chip');
        this.iconSlot = holder.element.querySelector('#icon-slot');
        this.removeSlot = holder.element.querySelector('#remove-slot');
        if (this.chip) {
            this.updateChip();
        }
        this.onAttributeChangedCallback(() => this.updateChip());
        return Promise.resolve();
    }
    updateChip() {
        if (!this.chip)
            return;
        // classes
        const classes = ['chip'];
        const color = this.getAttribute('color') || 'primary';
        classes.push(color);
        const size = this.getAttribute('size');
        if (size && size !== 'medium')
            classes.push(size);
        if (this.hasAttribute('disabled'))
            classes.push('disabled');
        this.chip.className = classes.join(' ');
        // icon
        const icon = this.getAttribute('icon');
        if (icon && this.iconSlot) {
            let existing = this.iconSlot.querySelector('re-icon');
            if (existing) {
                existing.setAttribute('icon', icon);
            }
            else {
                const reIcon = document.createElement('re-icon');
                reIcon.setAttribute('icon', icon);
                reIcon.setAttribute('size', 'sm');
                this.iconSlot.appendChild(reIcon);
            }
            this.iconSlot.classList.add('has-icon');
        }
        else if (this.iconSlot) {
            this.iconSlot.innerHTML = '';
            this.iconSlot.classList.remove('has-icon');
        }
    }
};
ReChip = __decorate([
    ReComponent({
        markupURL: "./src/components/ReChip.html",
        cssURL: "./src/components/ReChip.html.css",
        jsURL: "./src/components/ReChip.html.js",
        class: ReChip,
    }, "re-chip")
], ReChip);
export default ReChip;
//# sourceMappingURL=ReChip.html.js.map