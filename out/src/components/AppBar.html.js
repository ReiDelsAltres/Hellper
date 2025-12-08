var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AccessType, Component, ReComponent } from "@Purper";
let AppBar = class AppBar extends Component {
    static get observedAttributes() {
        return ["pos", "type", "no-hover"];
    }
    slots;
    isHovered = false;
    async postLoad(holder) {
        this.slots = this.shadowRoot.querySelectorAll('slot');
        this.slots.forEach(s => s.addEventListener('slotchange', this.slotChangeHandler));
        // listen for mouse/pointer/touch/focus events so hover-like state works on mobile
        this.addEventListener('mouseenter', this.mouseEnter);
        this.addEventListener('mouseleave', this.mouseLeave);
        this.addEventListener('pointerenter', this.pointerEnter);
        this.addEventListener('pointerleave', this.pointerLeave);
        this.addEventListener('touchstart', this.onTouchStart, { passive: true });
        this.addEventListener('touchend', this.onTouchEnd, { passive: true });
        this.addEventListener('focusin', this.onFocusIn);
        this.addEventListener('focusout', this.onFocusOut);
        // set initial hover state and try to propagate
        this.isHovered = this.matches(':hover');
        this.propagateTypeToSlotsIfNeeded();
    }
    slotChangeHandler = (e) => {
        const s = e.target;
        if (!s)
            return;
        this.propagateToSlot(s);
    };
    mouseEnter = () => {
        // legacy mouse events
        this.isHovered = true;
        this.propagateTypeToSlotsIfNeeded();
    };
    mouseLeave = () => {
        this.isHovered = false;
        this.propagateTypeToSlotsIfNeeded();
    };
    pointerEnter = (e) => {
        // only treat non-touch pointers as hover-like
        if (e.pointerType === 'touch')
            return;
        this.isHovered = true;
        this.propagateTypeToSlotsIfNeeded();
    };
    pointerLeave = (e) => {
        if (e.pointerType === 'touch')
            return;
        this.isHovered = false;
        this.propagateTypeToSlotsIfNeeded();
    };
    onTouchStart = () => {
        // On touch devices we do NOT change the hover state: we want "not hovered" behavior
        // so leave `isHovered` as-is (usually false) and re-run propagation to ensure current state
        this.propagateTypeToSlotsIfNeeded();
    };
    onTouchEnd = () => {
        // After a touch interaction we still keep non-hovered behavior; just re-run propagation
        setTimeout(() => this.propagateTypeToSlotsIfNeeded(), 20);
    };
    onFocusIn = () => {
        // focused state should be considered hovered for accessibility
        this.isHovered = true;
        this.propagateTypeToSlotsIfNeeded();
    };
    onFocusOut = () => {
        this.isHovered = false;
        this.propagateTypeToSlotsIfNeeded();
    };
    onDisconnected() {
        this.slots?.forEach(s => s.removeEventListener('slotchange', this.slotChangeHandler));
        this.removeEventListener('mouseenter', this.mouseEnter);
        this.removeEventListener('mouseleave', this.mouseLeave);
        this.removeEventListener('pointerenter', this.pointerEnter);
        this.removeEventListener('pointerleave', this.pointerLeave);
        this.removeEventListener('touchstart', this.onTouchStart);
        this.removeEventListener('touchend', this.onTouchEnd);
        this.removeEventListener('focusin', this.onFocusIn);
        this.removeEventListener('focusout', this.onFocusOut);
    }
    onAttributeChanged(name, oldValue, newValue) {
        if ((name === 'type' || name === 'no-hover') && oldValue !== newValue) {
            this.propagateTypeToSlotsIfNeeded();
        }
    }
    propagateTypeToSlotsIfNeeded() {
        // Condition (inverted): AppBar type === 'mini' AND (NOT hovered OR no-hover is present/true)
        const isMini = this.getAttribute('type') === 'mini';
        const noHoverAttr = this.getAttribute('no-hover');
        // consider no-hover active if it's present and not explicitly 'false'
        const noHoverActive = noHoverAttr !== null && noHoverAttr !== 'false';
        const shouldApply = isMini && (!this.isHovered || noHoverActive);
        this.slots = this.shadowRoot.querySelectorAll('slot');
        this.slots.forEach(s => {
            const assigned = s.assignedElements({ flatten: true });
            assigned.forEach(el => this.applyMiniToElementIfNeeded(el, shouldApply));
        });
    }
    propagateToSlot(slot) {
        const isMini = this.getAttribute('type') === 'mini';
        const noHoverAttr = this.getAttribute('no-hover');
        const noHoverActive = noHoverAttr !== null && noHoverAttr !== 'false';
        const shouldApply = isMini && (!this.isHovered || noHoverActive);
        const assigned = slot.assignedElements({ flatten: true });
        assigned.forEach(el => this.applyMiniToElementIfNeeded(el, shouldApply));
    }
    applyMiniToElementIfNeeded(el, shouldApply) {
        if (!el)
            return;
        if (shouldApply) {
            // do not override an explicit consumer-provided `mini` attribute
            if (!el.hasAttribute('mini')) {
                el.setAttribute('mini', '');
                el.setAttribute('data-appbar-mini', 'applied');
            }
        }
        else {
            // only remove what we previously applied
            if (el.getAttribute('data-appbar-mini') === 'applied') {
                el.removeAttribute('mini');
                el.removeAttribute('data-appbar-mini');
            }
        }
    }
};
AppBar = __decorate([
    ReComponent("./src/components/AppBar.html", "./src/components/AppBar.html.css", "./src/components/AppBar.html.ts", AccessType.BOTH, "app-bar")
], AppBar);
export default AppBar;
//# sourceMappingURL=AppBar.html.js.map