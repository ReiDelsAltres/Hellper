import { AccessType, Component, IElementHolder, ReComponent } from "@Purper";
import AppBar from "./AppBar.html";

@ReComponent(
    "./src/components/AppLayout.hmle",
    "./src/components/AppLayout.html.css",
    "./src/components/AppLayout.html.ts",
    AccessType.BOTH,
    "app-layout",
    "./src/components/AppLayout.html.lt.css"
)
export default class AppLayout extends Component {
    static get observedAttributes() {
        return ["sidebar-hidden", "topbar-hidden"];
    }

    private sidebarBtn!: HTMLButtonElement;
    private topbarBtn!: HTMLButtonElement;
    private sidebar!: AppBar;
    private topbar!: AppBar;

    protected async preLoad(holder: IElementHolder): Promise<void> {
        // ensure the host reflects the current sidebar/topbar type so outside CSS (eg. page) can react
        try {
            const sType = this.sidebar?.getAttribute('type') ?? null;
            if (sType) this.setAttribute('sidebar', sType);

            const tType = this.topbar?.getAttribute('type') ?? null;
            if (tType) this.setAttribute('topbar', tType);
        } catch {
            // ignore if refs are not available
        }
    }

    private toggleAppbar(barId: number): void {
        switch (barId) {
            case 0:
                var isHidden = this.sidebar.getAttribute("type") === "hidden";
                if (isHidden) {
                    this.sidebar.setAttribute("type", "mini");
                    this.setAttribute('sidebar', 'mini');
                    this.sidebarBtn.setAttribute("variant", "outlined");
                } else {
                    this.sidebar.setAttribute("type", "hidden");
                    this.setAttribute('sidebar', 'hidden');
                    this.sidebarBtn.setAttribute("variant", "filled");
                }
                break;
            case 1: 
                var isHidden = this.topbar.getAttribute("type") === "hidden";
                if (isHidden) {
                    this.topbar.setAttribute("type", "mini");
                    this.setAttribute('topbar', 'mini');
                    this.topbarBtn.setAttribute("variant", "outlined");
                } else {
                    this.topbar.setAttribute("type", "hidden");
                    this.setAttribute('topbar', 'hidden');
                    this.topbarBtn.setAttribute("variant", "filled");
                }
                break;
        }
    }
}
