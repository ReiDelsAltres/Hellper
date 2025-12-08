import { AccessType, Component, IElementHolder, ReComponent } from "@Purper";

@ReComponent(
    "./src/components/AppBar.html",
    "./src/components/AppBar.html.css",
    "./src/components/AppBar.html.ts",
    AccessType.BOTH,
    "app-bar"
)
export default class AppBar extends Component {
    static get observedAttributes() {
        return ["pos", "type", "no-hover"];
    }
    private slots!: NodeListOf<HTMLSlotElement>;
    private isHovered: boolean = false;

    protected async postLoad(holder: IElementHolder): Promise<void> {
        this.slots = this.shadowRoot!.querySelectorAll('slot');
        this.slots.forEach(s => s.addEventListener('slotchange', this.slotChangeHandler));

        // listen for mouse/pointer/touch/focus events so hover-like state works on mobile
        this.addEventListener('mouseenter', this.mouseEnter);
        this.addEventListener('mouseleave', this.mouseLeave);
        this.addEventListener('pointerenter', this.mouseEnter);
        this.addEventListener('pointerleave', this.mouseLeave);
        this.addEventListener('touchstart', this.onTouchStart, { passive: true });
        this.addEventListener('touchend', this.onTouchEnd, { passive: true });
        this.addEventListener('focusin', this.onFocusIn);
        this.addEventListener('focusout', this.onFocusOut);

        // set initial hover state and try to propagate
        this.isHovered = this.matches(':hover');
        this.propagateTypeToSlotsIfNeeded();
    }

    private slotChangeHandler = (e: Event) => {
        const s = e.target as HTMLSlotElement;
        if (!s) return;
        this.propagateToSlot(s);
    };

    private mouseEnter = () => {
        this.isHovered = true;
        this.propagateTypeToSlotsIfNeeded();
    };

    private mouseLeave = () => {
        this.isHovered = false;
        this.propagateTypeToSlotsIfNeeded();
    };

    private onTouchStart = () => {
        // treat a touch start as hover enter on touch devices
        this.isHovered = true;
        this.propagateTypeToSlotsIfNeeded();
    };

    private onTouchEnd = () => {
        // remove hovered state shortly after touch ends so interactions still feel responsive
        this.isHovered = false;
        // small timeout allows click handlers on children to run
        setTimeout(() => this.propagateTypeToSlotsIfNeeded(), 20);
    };

    private onFocusIn = () => {
        // focused state should be considered hovered for accessibility
        this.isHovered = true;
        this.propagateTypeToSlotsIfNeeded();
    };

    private onFocusOut = () => {
        this.isHovered = false;
        this.propagateTypeToSlotsIfNeeded();
    };

    onDisconnected(): void {
        this.slots?.forEach(s => s.removeEventListener('slotchange', this.slotChangeHandler));
        this.removeEventListener('mouseenter', this.mouseEnter);
        this.removeEventListener('mouseleave', this.mouseLeave);
        this.removeEventListener('pointerenter', this.mouseEnter);
        this.removeEventListener('pointerleave', this.mouseLeave);
        this.removeEventListener('touchstart', this.onTouchStart);
        this.removeEventListener('touchend', this.onTouchEnd);
        this.removeEventListener('focusin', this.onFocusIn);
        this.removeEventListener('focusout', this.onFocusOut);
    }

    onAttributeChanged(name: string, oldValue: any, newValue: any): void {
        if ((name === 'type' || name === 'no-hover') && oldValue !== newValue) {
            this.propagateTypeToSlotsIfNeeded();
        }
    }


    private propagateTypeToSlotsIfNeeded(): void {
        // Condition (inverted): AppBar type === 'mini' AND (NOT hovered OR no-hover is present/true)
        const isMini = this.getAttribute('type') === 'mini';
        const noHoverAttr = this.getAttribute('no-hover');
        // consider no-hover active if it's present and not explicitly 'false'
        const noHoverActive = noHoverAttr !== null && noHoverAttr !== 'false';

        const shouldApply = isMini && (!this.isHovered || noHoverActive);

        this.slots = this.shadowRoot!.querySelectorAll('slot');
        this.slots.forEach(s => {
            const assigned = s.assignedElements({ flatten: true });
            assigned.forEach(el => this.applyMiniToElementIfNeeded(el as HTMLElement, shouldApply));
        });
    }

    private propagateToSlot(slot: HTMLSlotElement): void {
        const isMini = this.getAttribute('type') === 'mini';
        const noHoverAttr = this.getAttribute('no-hover');
        const noHoverActive = noHoverAttr !== null && noHoverAttr !== 'false';
        const shouldApply = isMini && (!this.isHovered || noHoverActive);
        const assigned = slot.assignedElements({ flatten: true });
        assigned.forEach(el => this.applyMiniToElementIfNeeded(el as HTMLElement, shouldApply));
    }

    private applyMiniToElementIfNeeded(el: HTMLElement, shouldApply: boolean) {
        if (!el) return;
        if (shouldApply) {
            // do not override an explicit consumer-provided `mini` attribute
            if (!el.hasAttribute('mini')) {
                el.setAttribute('mini', '');
                el.setAttribute('data-appbar-mini', 'applied');
            }
        } else {
            // only remove what we previously applied
            if (el.getAttribute('data-appbar-mini') === 'applied') {
                el.removeAttribute('mini');
                el.removeAttribute('data-appbar-mini');
            }
        }
    }
}