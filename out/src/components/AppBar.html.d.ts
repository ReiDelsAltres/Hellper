import { TemplateHolder, Attribute } from "@Purper";
import ComponentCore from "./core/ComponentCore.js";
export default class AppBar extends ComponentCore {
    Type: Attribute<"mini" | "full" | null>;
    Pos: Attribute<"vertical" | "horizontal">;
    Hidden: Attribute<boolean | null>;
    NoHover: Attribute<boolean | null>;
    protected preLoad(holder: TemplateHolder): Promise<void>;
    notifyAllChildren(not: (element: Element) => void): void;
}
//# sourceMappingURL=AppBar.html.d.ts.map