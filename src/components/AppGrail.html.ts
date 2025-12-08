import { AccessType, Component, ReComponent } from "@Purper";

@ReComponent(
  "./src/components/AppGrail.html",
  "./src/components/AppGrail.html.css",
  "./src/components/AppGrail.html.ts",
  AccessType.BOTH,
  "app-grail"
)
export default class AppGrail extends Component {
    private opened: boolean;

    private toggle(event: PointerEvent, element: HTMLElement): void {
        switch (this.opened) {
            case true:
                element.setAttribute("variant", "filled");
                break;
            case false:
            default:
                element.setAttribute("variant", "outlined");
                break;
        }
    }
}