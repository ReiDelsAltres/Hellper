import { Component, IElementHolder } from "@Purper";
export default class PopUp extends Component {
    static get observedAttributes(): string[];
    private overlay?;
    private container?;
    private anchorElement?;
    private clickOutsideHandler?;
    protected preLoad(holder: IElementHolder): Promise<void>;
    /** Find anchor element by selector */
    private findAnchor;
    /** Position popup relative to anchor */
    private positionToAnchor;
    /** Open the popup */
    open(): void;
    /** Close the popup */
    close(): void;
    /** Toggle open/closed */
    toggle(): void;
    /** Check if open */
    get isOpen(): boolean;
}
//# sourceMappingURL=PopUp.html.d.ts.map