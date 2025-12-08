import { AccessType, Component, IElementHolder, ReComponent } from "@Purper";

@ReComponent(
  "./src/components/AppBar.html",
  "./src/components/AppBar.html.css",
  "./src/components/AppBar.html.ts",
  AccessType.BOTH,
  "app-bar"
)
export default class AppBar extends Component {
    protected async postLoad(holder: IElementHolder): Promise<void> {
        this.addEventListener("" , () => {
            console.log("AppBar hovered");
        }
    }
}