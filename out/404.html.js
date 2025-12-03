import { Router, HOSTING_ORIGIN } from "@Purper";
let fff = window.location;
Router.savePersistedRoute(new URL(window.location.href, HOSTING_ORIGIN));
Router.legacyRouteTo("index.html");
//# sourceMappingURL=404.html.js.map