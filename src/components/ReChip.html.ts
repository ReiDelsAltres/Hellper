import { IElementHolder, Component } from "@Purper";

export default class ReChip extends Component {
  private chip?: HTMLElement;
  private iconSlot?: HTMLElement;
  private removeSlot?: HTMLElement;

  static get observedAttributes() {
    return ['size', 'color', 'icon', 'disabled', 'interactive'];
  }

  protected preLoad(holder: IElementHolder): Promise<void> {
    this.chip = holder.element.querySelector('.chip') as HTMLElement;
    this.iconSlot = holder.element.querySelector('#icon-slot') as HTMLElement;
    this.removeSlot = holder.element.querySelector('#remove-slot') as HTMLElement;

    if (this.chip) {
      this.updateChip();
    }

    this.onAttributeChangedCallback(() => this.updateChip());

    return Promise.resolve();
  }

  private updateChip() {
    if (!this.chip) return;

    // classes
    const classes = ['chip'];
    const color = this.getAttribute('color') || 'primary';
    classes.push(color);

    const size = this.getAttribute('size');
    if (size && size !== 'medium') classes.push(size);

    if (this.hasAttribute('disabled')) classes.push('disabled');

    this.chip.className = classes.join(' ');

    // icon
    const icon = this.getAttribute('icon');
    if (icon && this.iconSlot) {
      let existing = this.iconSlot.querySelector('svg-icon');
      if (existing) {
        existing.setAttribute('icon', icon);
      } else {
        const svg = document.createElement('svg-icon');
        svg.setAttribute('icon', icon);
        svg.setAttribute('size', 'sm');
        this.iconSlot.appendChild(svg);
      }
      this.iconSlot.classList.add('has-icon');
    } else if (this.iconSlot) {
      this.iconSlot.innerHTML = '';
      this.iconSlot.classList.remove('has-icon');
    }
  }

}
