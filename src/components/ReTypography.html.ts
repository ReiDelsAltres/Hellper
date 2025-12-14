import { IElementHolder, Component, ReComponent, AccessType } from "@Purper";

@ReComponent({
  markupURL: "./src/components/ReTypography.html",
  cssURL: "./src/components/ReTypography.html.css",
  jsURL: "./src/components/ReTypography.html.ts",
  class: ReTypography,
},"re-typography")
export default class ReTypography extends Component {
  static get observedAttributes() {
    return ["variant", "weight", "color", "align", "uppercase", "truncate"];
  }

  protected preLoad(holder: IElementHolder): Promise<void> {
    this.onAttributeChangedCallback(() => this.updateTypography());
    this.updateTypography();
    return Promise.resolve();
  }

  private updateTypography(): void {
    const textEl = this.shadowRoot?.querySelector<HTMLElement>(".typo-text") ?? this.querySelector(".typo-text");
    if (!textEl) return;

    // text alignment handled via CSS attribute selectors
    const isUpper = this.hasAttribute("uppercase");
    const isTruncate = this.hasAttribute("truncate");

    textEl.toggleAttribute("data-upper", isUpper);
    textEl.toggleAttribute("data-truncate", isTruncate);
  }
}
