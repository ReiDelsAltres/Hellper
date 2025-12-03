import { Component } from "@Purper";
export default class ReChip extends Component {
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
            let existing = this.iconSlot.querySelector('svg-icon');
            if (existing) {
                existing.setAttribute('icon', icon);
            }
            else {
                const svg = document.createElement('svg-icon');
                svg.setAttribute('icon', icon);
                svg.setAttribute('size', 'sm');
                this.iconSlot.appendChild(svg);
            }
            this.iconSlot.classList.add('has-icon');
        }
        else if (this.iconSlot) {
            this.iconSlot.innerHTML = '';
            this.iconSlot.classList.remove('has-icon');
        }
    }
}
//# sourceMappingURL=ReChip.html.js.map