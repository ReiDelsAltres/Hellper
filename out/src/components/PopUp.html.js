var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ReComponent } from "@Purper";
let PopUp = class PopUp extends Component {
    static get observedAttributes() {
        return ['open', 'modal', 'anchor', 'placement'];
    }
    overlay;
    container;
    anchorElement;
    clickOutsideHandler;
    preLoad(holder) {
        this.overlay = holder.documentFragment.querySelector('.popup-overlay');
        this.container = holder.documentFragment.querySelector('.popup-container');
        // Click overlay to close (unless modal)
        this.overlay?.addEventListener('click', () => {
            if (!this.hasAttribute('modal')) {
                this.close();
            }
        });
        // Escape key to close
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.hasAttribute('modal')) {
                this.close();
            }
        });
        // Click outside handler for anchored mode
        this.clickOutsideHandler = (e) => {
            if (!this.contains(e.target) && !this.anchorElement?.contains(e.target)) {
                this.close();
            }
        };
        return Promise.resolve();
    }
    /** Find anchor element by selector */
    findAnchor() {
        const anchor = this.getAttribute('anchor');
        if (!anchor)
            return null;
        try {
            if (anchor.startsWith('#') || anchor.startsWith('.')) {
                return document.querySelector(anchor);
            }
            return document.getElementById(anchor) || document.querySelector(anchor);
        }
        catch {
            return null;
        }
    }
    /** Position popup relative to anchor */
    positionToAnchor() {
        if (!this.anchorElement)
            return;
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
    open() {
        // Check for anchor
        this.anchorElement = this.findAnchor();
        if (this.anchorElement) {
            this.setAttribute('anchored', '');
            // Position after display
            this.setAttribute('open', '');
            requestAnimationFrame(() => this.positionToAnchor());
            // Listen for outside clicks
            document.addEventListener('click', this.clickOutsideHandler);
        }
        else {
            this.removeAttribute('anchored');
            this.setAttribute('open', '');
        }
        // Focus container
        this.container?.focus();
        // Dispatch event
        this.dispatchEvent(new CustomEvent('popup-open', { bubbles: true }));
    }
    /** Close the popup */
    close() {
        this.removeAttribute('open');
        document.removeEventListener('click', this.clickOutsideHandler);
        // Dispatch event
        this.dispatchEvent(new CustomEvent('popup-close', { bubbles: true }));
    }
    /** Toggle open/closed */
    toggle() {
        if (this.hasAttribute('open')) {
            this.close();
        }
        else {
            this.open();
        }
    }
    /** Check if open */
    get isOpen() {
        return this.hasAttribute('open');
    }
};
PopUp = __decorate([
    ReComponent({
        markupURL: "./src/components/PopUp.html",
        cssURL: "./src/components/PopUp.html.css",
        jsURL: "./src/components/PopUp.html.js",
        class: PopUp,
    }, "pop-up")
], PopUp);
export default PopUp;
//# sourceMappingURL=PopUp.html.js.map