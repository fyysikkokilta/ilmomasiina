import React from "react";

import { init as initSentry } from "@sentry/browser";
import { createRoot } from "react-dom/client";

// Import via full path to reduce entry chunk size.
import { configureApi } from "@tietokilta/ilmomasiina-client/dist/api";
import AppContainer from "./containers/AppContainer";
import { apiUrl } from "./paths";

import "./i18n";

if (PROD && SENTRY_DSN) {
  initSentry({ dsn: SENTRY_DSN });
}

configureApi(apiUrl);

const root = createRoot(document.getElementById("root")!);
root.render(<AppContainer />);
