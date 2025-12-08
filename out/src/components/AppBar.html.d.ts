import { Component, IElementHolder } from "@Purper";
export default class AppBar extends Component {
    static get observedAttributes(): string[];
    private slots;
    private isHovered;
    protected postLoad(holder: IElementHolder): Promise<void>;
    private slotChangeHandler;
    private mouseEnter;
    private mouseLeave;
    private pointerEnter;
    private pointerLeave;
    private onTouchStart;
    private onTouchEnd;
    private onFocusIn;
    private onFocusOut;
    onDisconnected(): void;
    onAttributeChanged(name: string, oldValue: any, newValue: any): void;
    private propagateTypeToSlotsIfNeeded;
    private propagateToSlot;
    private applyMiniToElementIfNeeded;
}
//# sourceMappingURL=AppBar.html.d.ts.map