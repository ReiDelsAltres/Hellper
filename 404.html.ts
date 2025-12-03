import { Router, HOSTING_ORIGIN } from "@Purper";

Router.savePersistedRoute(new URL(window.location.href, HOSTING_ORIGIN));
Router.legacyRouteTo("index.html");