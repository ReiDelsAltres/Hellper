import { AccessType, Component, IElementHolder, ReComponent, TemplateHolder } from "@Purper";
import AppBar from "./AppBar.html";

@ReComponent({
    markupURL: "./src/components/AppLayout.hmle",
    cssURL: "./src/components/AppLayout.html.css",
    ltCssURL: "./src/components/AppLayout.html.lt.css",
    jsURL: "./src/components/AppLayout.html.ts",
}, "app-layout")
export default class AppLayout extends Component {
    static get observedAttributes() {
        return ["sidebar", "topbar"];
    }

    private sidebarBtn!: HTMLButtonElement;
    private topbarBtn!: HTMLButtonElement;
    private sidebar!: AppBar;
    private topbar!: AppBar;

    protected async preLoad(holder: TemplateHolder): Promise<void> {
        // ensure the host reflects the current sidebar/topbar type so outside CSS (eg. page) can react
        const sType = this.sidebar?.getAttribute('type') ?? null;
        if (sType) this.setAttribute('sidebar', sType);

        const tType = this.topbar?.getAttribute('type') ?? null;
        if (tType) this.setAttribute('topbar', tType);

        this.sidebar.addEventListener("mouseenter", (event) => {
            this.sidebar.notifyAllChildren((el) => {
                el.removeAttribute("mini");
            });
        });
        this.sidebar.addEventListener("mouseleave", (event) => {
            this.sidebar.notifyAllChildren((el) => {
                el.setAttribute("mini", "");
            });
        });
    }

    public toggleAppbar(barId: number) {
        switch (barId) {
            case 0:
                var isHidden = this.sidebar.hidden;
                if (isHidden) {
                    this.sidebar.hidden = false;
                    this.setAttribute('sidebar', 'mini');
                    this.sidebarBtn.setAttribute("variant", "outlined");
                } else {
                    this.sidebar.hidden = true;
                    this.setAttribute('sidebar', 'hidden');
                    this.sidebarBtn.setAttribute("variant", "filled");
                }
                break;
            case 1:
                var isHidden = this.topbar.hidden;
                if (isHidden) {
                    this.topbar.hidden = false;
                    this.setAttribute('topbar', 'mini');
                    this.topbarBtn.setAttribute("variant", "outlined");
                } else {
                    this.topbar.hidden = true;
                    this.setAttribute('topbar', 'hidden');
                    this.topbarBtn.setAttribute("variant", "filled");
                }
                break;
        }

    }
}
