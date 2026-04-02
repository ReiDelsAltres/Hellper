import { TemplateHolder, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';
export type TooltipTrigger = 'hover' | 'click' | 'manual';
export default class ReTooltip extends ComponentCore {
    Placement: Attribute<TooltipPlacement>;
    Align: Attribute<TooltipAlign>;
    Trigger: Attribute<TooltipTrigger>;
    Delay: Attribute<number>;
    Anchor: Attribute<string | null>;
    private body;
    private tail;
    private _anchorEl;
    private _showTimeout;
    private _hideTimeout;
    private _clickOutsideHandler;
    private _escHandler;
    private _hoverEnterHandler;
    private _hoverLeaveHandler;
    private _clickHandler;
    private _resizeObserver;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    /** Resolve the anchor element */
    private _resolveAnchor;
    private _bindAnchor;
    private _bindTrigger;
    private _unbindTrigger;
    /** Position the tooltip relative to the anchor */
    private _reposition;
    /** Position the tail/pointer to point at the anchor */
    private _positionTail;
    /** Open the tooltip */
    open(): void;
    /** Close the tooltip */
    close(): void;
    /** Toggle open/closed */
    toggle(): void;
    /** Whether the tooltip is currently open */
    get isOpen(): boolean;
    /** Set the anchor element programmatically */
    setAnchorElement(el: HTMLElement): void;
    onDisconnected(): void;
}
//# sourceMappingURL=ReTooltip.html.d.ts.map