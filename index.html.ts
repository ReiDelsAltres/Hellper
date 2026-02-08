import { Router, HOSTING } from "@Purper";

import "./src/components/ColorPalettePreview.html.js"
import "./src/components/ReTypography.html.js"
import "./src/components/ReInput.html.js"
import "./src/components/AppBar.html.js";
import "./src/components/AppLayout.html.js";

import "./src/components/ColorPalettePreview.html.js";
import "./src/components/ReButton.html.js";
import "./src/components/ReButtonGroup.html.js";
import "./src/components/ReChip.html.js";
import "./src/components/ReIcon.html.js";
import "./src/components/ReCheckbox.html.js";
import "./src/components/PopUp.html.js";
import "./src/components/PaperComponent.html.js";

import "./src/pages/MainPage.html.js";
import "./src/pages/PalettePage.html.js"
import "./src/pages/ComponentShowcasePage.html.js"
import "./src/pages/ComponentPlaygroundPage.html.js"
import "./src/pages/TestingPage.html.js"
import "./src/pages/TestingSubPage.html.js"
import "./src/pages/TestingActualPage.html.js"
import "./src/pages/TestingAllPage.html.js";

export default class Index {
    public static async initialize(): Promise<void> {
        await Promise.all([     
        ]);
    }
}

const loc = window.location;
console.log(`[App] initialized at ${loc.href} (origin: ${loc.origin}, path: ${loc.pathname}${loc.search}${loc.hash})`);


Index.initialize().then(() => {
    let persistedRoute: URL | null = Router.getPersistedRoute();

    if (persistedRoute) {
        Router.clearPersistedRoute();
        Router.tryRouteTo(persistedRoute);
    }
    else {
        Router.tryRouteTo(new URL(HOSTING + "/", window.location.origin));
    }
}).catch(error => {
    console.error("Error during initialization:", error);
});