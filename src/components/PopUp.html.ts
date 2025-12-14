import { Component, IElementHolder, ReComponent } from "@Purper";

@ReComponent({
    markupURL: "./src/components/PopUp.html",
    cssURL: "./src/components/PopUp.html.css",
    jsURL: "./src/components/PopUp.html.js",
    class: PopUp,
}, "pop-up")
export default class PopUp extends Component {
    static get observedAttributes() {
        return ['open', 'modal', 'anchor', 'placement'];
    }

    private overlay?: HTMLElement;
    private container?: HTMLElement;
    private anchorElement?: Element | null;
    private clickOutsideHandler?: (e: MouseEvent) => void;

    protected preLoad(holder: IElementHolder): Promise<void> {
        this.overlay = holder.element.querySelector('.popup-overlay') as HTMLElement;
        this.container = holder.element.querySelector('.popup-container') as HTMLElement;

        // Click overlay to close (unless modal)
        this.overlay?.addEventListener('click', () => {
            if (!this.hasAttribute('modal')) {
                this.close();
            }
        });

        // Escape key to close
        this.addEventListener('keydown', (e: Event) => {
            if ((e as KeyboardEvent).key === 'Escape' && !this.hasAttribute('modal')) {
                this.close();
            }
        });

        // Click outside handler for anchored mode
        this.clickOutsideHandler = (e: MouseEvent) => {
            if (!this.contains(e.target as Node) && !this.anchorElement?.contains(e.target as Node)) {
                this.close();
            }
        };

        return Promise.resolve();
    }

    /** Find anchor element by selector */
    private findAnchor(): Element | null {
        const anchor = this.getAttribute('anchor');
        if (!anchor) return null;
        try {
            if (anchor.startsWith('#') || anchor.startsWith('.')) {
                return document.querySelector(anchor);
            }
            return document.getElementById(anchor) || document.querySelector(anchor);
        } catch {
            return null;
        }
    }

    /** Position popup relative to anchor */
    private positionToAnchor(): void {
        if (!this.anchorElement) return;

        const rect = this.anchorElement.getBoundingClientRect();
        const placement = this.getAttribute('placement') || 'bottom';
        const gap = 8;

        let top = 0;
        let left = 0;

        switch (placement) {
            case 'top':
                top = rect.top + window.scrollY - this.offsetHeight - gap;
                left = rect.left + window.scrollX + rect.width / 2 - this.offsetWidth / 2;
                break;
            case 'bottom':
                top = rect.bottom + window.scrollY + gap;
                left = rect.left + window.scrollX + rect.width / 2 - this.offsetWidth / 2;
                break;
            case 'left':
                top = rect.top + window.scrollY + rect.height / 2 - this.offsetHeight / 2;
                left = rect.left + window.scrollX - this.offsetWidth - gap;
                break;
            case 'right':
                top = rect.top + window.scrollY + rect.height / 2 - this.offsetHeight / 2;
                left = rect.right + window.scrollX + gap;
                break;
        }

        // Keep within viewport
        left = Math.max(8, Math.min(left, window.innerWidth - this.offsetWidth - 8));
        top = Math.max(8, top);

        this.style.top = top + 'px';
        this.style.left = left + 'px';
    }

    /** Open the popup */
    public open(): void {
        // Check for anchor
        this.anchorElement = this.findAnchor();

        if (this.anchorElement) {
            this.setAttribute('anchored', '');
            // Position after display
            this.setAttribute('open', '');
            requestAnimationFrame(() => this.positionToAnchor());
            // Listen for outside clicks
            document.addEventListener('click', this.clickOutsideHandler!);
        } else {
            this.removeAttribute('anchored');
            this.setAttribute('open', '');
        }

        // Focus container
        this.container?.focus();
        // Dispatch event
        this.dispatchEvent(new CustomEvent('popup-open', { bubbles: true }));
    }

    /** Close the popup */
    public close(): void {
        this.removeAttribute('open');
        document.removeEventListener('click', this.clickOutsideHandler!);
        // Dispatch event
        this.dispatchEvent(new CustomEvent('popup-close', { bubbles: true }));
    }

    /** Toggle open/closed */
    public toggle(): void {
        if (this.hasAttribute('open')) {
            this.close();
        } else {
            this.open();
        }
    }

    /** Check if open */
    public get isOpen(): boolean {
        return this.hasAttribute('open');
    }
}
