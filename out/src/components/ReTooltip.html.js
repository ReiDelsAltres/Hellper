var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReComponent, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
let ReTooltip = class ReTooltip extends ComponentCore {
    Placement = new Attribute(this, 'placement', 'bottom');
    Align = new Attribute(this, 'align', 'center');
    Trigger = new Attribute(this, 'trigger', 'hover');
    Delay = new Attribute(this, 'delay', 200);
    Anchor = new Attribute(this, 'anchor', null);
    body;
    tail;
    _anchorEl = null;
    _showTimeout = null;
    _hideTimeout = null;
    _clickOutsideHandler = null;
    _escHandler = null;
    _hoverEnterHandler = null;
    _hoverLeaveHandler = null;
    _clickHandler = null;
    _resizeObserver = null;
    async preLoad(holder) {
        // Escape key handler
        this._escHandler = (e) => {
            if (e.key === 'Escape')
                this.close();
        };
        // Click outside handler
        this._clickOutsideHandler = (e) => {
            if (!this.contains(e.target) && !this._anchorEl?.contains(e.target)) {
                this.close();
            }
        };
        // Set up trigger bindings after a frame (so anchor is available)
        requestAnimationFrame(() => this._bindAnchor());
        // Watch for placement/align changes to reposition
        this.Placement.subscribe(() => this._reposition());
        this.Align.subscribe(() => this._reposition());
        this.Trigger.subscribe(() => {
            this._unbindTrigger();
            this._bindTrigger();
        });
    }
    /** Resolve the anchor element */
    _resolveAnchor() {
        const anchorVal = this.Anchor.value;
        if (!anchorVal) {
            // Default: anchor to previous sibling or parent
            return this.previousElementSibling || this.parentElement;
        }
        // Try CSS selector in document
        try {
            return document.querySelector(anchorVal);
        }
        catch {
            return null;
        }
    }
    _bindAnchor() {
        this._anchorEl = this._resolveAnchor();
        this._bindTrigger();
    }
    _bindTrigger() {
        if (!this._anchorEl)
            return;
        const trigger = this.Trigger.value;
        if (trigger === 'hover') {
            this._hoverEnterHandler = () => {
                if (this._hideTimeout !== null) {
                    clearTimeout(this._hideTimeout);
                    this._hideTimeout = null;
                }
                const delay = Number(this.Delay.value) || 200;
                this._showTimeout = window.setTimeout(() => this.open(), delay);
            };
            this._hoverLeaveHandler = () => {
                if (this._showTimeout !== null) {
                    clearTimeout(this._showTimeout);
                    this._showTimeout = null;
                }
                this._hideTimeout = window.setTimeout(() => this.close(), 100);
            };
            this._anchorEl.addEventListener('mouseenter', this._hoverEnterHandler);
            this._anchorEl.addEventListener('mouseleave', this._hoverLeaveHandler);
            // Also keep tooltip open when hovering over it
            this.addEventListener('mouseenter', () => {
                if (this._hideTimeout !== null) {
                    clearTimeout(this._hideTimeout);
                    this._hideTimeout = null;
                }
            });
            this.addEventListener('mouseleave', () => {
                this._hideTimeout = window.setTimeout(() => this.close(), 100);
            });
        }
        else if (trigger === 'click') {
            this._clickHandler = () => this.toggle();
            this._anchorEl.addEventListener('click', this._clickHandler);
        }
        // 'manual' mode: no auto-binding
    }
    _unbindTrigger() {
        if (this._anchorEl && this._hoverEnterHandler) {
            this._anchorEl.removeEventListener('mouseenter', this._hoverEnterHandler);
        }
        if (this._anchorEl && this._hoverLeaveHandler) {
            this._anchorEl.removeEventListener('mouseleave', this._hoverLeaveHandler);
        }
        if (this._anchorEl && this._clickHandler) {
            this._anchorEl.removeEventListener('click', this._clickHandler);
        }
        this._hoverEnterHandler = null;
        this._hoverLeaveHandler = null;
        this._clickHandler = null;
    }
    /** Position the tooltip relative to the anchor */
    _reposition() {
        if (!this._anchorEl || !this.hasAttribute('open'))
            return;
        const anchorRect = this._anchorEl.getBoundingClientRect();
        const placement = this.Placement.value ?? 'bottom';
        const align = this.Align.value ?? 'center';
        const gap = 12; // space between anchor and tooltip (including tail)
        // We need to measure body AFTER it's visible
        // Use requestAnimationFrame to get rendered size
        requestAnimationFrame(() => {
            const bodyRect = this.body.getBoundingClientRect();
            const bw = bodyRect.width;
            const bh = bodyRect.height;
            let top = 0;
            let left = 0;
            // Primary axis positioning
            switch (placement) {
                case 'top':
                    top = anchorRect.top - bh - gap;
                    break;
                case 'bottom':
                    top = anchorRect.bottom + gap;
                    break;
                case 'left':
                    left = anchorRect.left - bw - gap;
                    break;
                case 'right':
                    left = anchorRect.right + gap;
                    break;
            }
            // Secondary axis alignment
            if (placement === 'top' || placement === 'bottom') {
                switch (align) {
                    case 'start':
                        left = anchorRect.left;
                        break;
                    case 'center':
                        left = anchorRect.left + anchorRect.width / 2 - bw / 2;
                        break;
                    case 'end':
                        left = anchorRect.right - bw;
                        break;
                }
            }
            else {
                // left/right placement
                switch (align) {
                    case 'start':
                        top = anchorRect.top;
                        break;
                    case 'center':
                        top = anchorRect.top + anchorRect.height / 2 - bh / 2;
                        break;
                    case 'end':
                        top = anchorRect.bottom - bh;
                        break;
                }
            }
            // Viewport clamping
            const margin = 8;
            left = Math.max(margin, Math.min(left, window.innerWidth - bw - margin));
            top = Math.max(margin, Math.min(top, window.innerHeight - bh - margin));
            this.style.left = `${left}px`;
            this.style.top = `${top}px`;
            // Position the tail
            this._positionTail(anchorRect, left, top, bw, bh);
        });
    }
    /** Position the tail/pointer to point at the anchor */
    _positionTail(anchorRect, tooltipLeft, tooltipTop, bw, bh) {
        const placement = this.Placement.value ?? 'bottom';
        const tailSize = 10;
        // Reset inline styles
        this.tail.style.top = '';
        this.tail.style.bottom = '';
        this.tail.style.left = '';
        this.tail.style.right = '';
        const anchorCenterX = anchorRect.left + anchorRect.width / 2 - tooltipLeft;
        const anchorCenterY = anchorRect.top + anchorRect.height / 2 - tooltipTop;
        switch (placement) {
            case 'bottom':
                // Tail on top of body, pointing up
                this.tail.style.top = `-${tailSize}px`;
                this.tail.style.left = `${Math.max(16, Math.min(anchorCenterX - tailSize, bw - 32))}px`;
                break;
            case 'top':
                // Tail on bottom of body, pointing down
                this.tail.style.bottom = `-${tailSize}px`;
                this.tail.style.left = `${Math.max(16, Math.min(anchorCenterX - tailSize, bw - 32))}px`;
                break;
            case 'right':
                // Tail on left of body, pointing left
                this.tail.style.left = `-${tailSize}px`;
                this.tail.style.top = `${Math.max(16, Math.min(anchorCenterY - tailSize, bh - 32))}px`;
                break;
            case 'left':
                // Tail on right of body, pointing right
                this.tail.style.right = `-${tailSize}px`;
                this.tail.style.top = `${Math.max(16, Math.min(anchorCenterY - tailSize, bh - 32))}px`;
                break;
        }
    }
    /** Open the tooltip */
    open() {
        if (this.hasAttribute('open'))
            return;
        this.setAttribute('open', '');
        this._reposition();
        if (this.Trigger.value === 'click') {
            // Delay adding click-outside listener to avoid immediate close
            requestAnimationFrame(() => {
                document.addEventListener('click', this._clickOutsideHandler);
            });
            document.addEventListener('keydown', this._escHandler);
        }
        this.dispatchEvent(new CustomEvent('tooltip-open', { bubbles: true }));
    }
    /** Close the tooltip */
    close() {
        if (!this.hasAttribute('open'))
            return;
        this.removeAttribute('open');
        if (this._showTimeout !== null) {
            clearTimeout(this._showTimeout);
            this._showTimeout = null;
        }
        document.removeEventListener('click', this._clickOutsideHandler);
        document.removeEventListener('keydown', this._escHandler);
        this.dispatchEvent(new CustomEvent('tooltip-close', { bubbles: true }));
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
    /** Whether the tooltip is currently open */
    get isOpen() {
        return this.hasAttribute('open');
    }
    /** Set the anchor element programmatically */
    setAnchorElement(el) {
        this._unbindTrigger();
        this._anchorEl = el;
        this._bindTrigger();
    }
    onDisconnected() {
        this._unbindTrigger();
        document.removeEventListener('click', this._clickOutsideHandler);
        document.removeEventListener('keydown', this._escHandler);
        if (this._showTimeout !== null)
            clearTimeout(this._showTimeout);
        if (this._hideTimeout !== null)
            clearTimeout(this._hideTimeout);
        this._resizeObserver?.disconnect();
    }
};
ReTooltip = __decorate([
    ReComponent({
        markupURL: "./src/components/ReTooltip.hmle",
        cssURL: "./out/src/components/ReTooltip.html.css",
    }, "re-tooltip")
], ReTooltip);
export default ReTooltip;
//# sourceMappingURL=ReTooltip.html.js.map