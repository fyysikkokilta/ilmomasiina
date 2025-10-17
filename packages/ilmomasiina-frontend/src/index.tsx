import React from "react";

import * as Sentry from "@sentry/browser";
import ReactDOM from "react-dom";

import "./i18n";

import { configureApi } from "@tietokilta/ilmomasiina-client";
import AppContainer from "./containers/AppContainer";
import { apiUrl } from "./paths";

if (PROD && SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN });
}

configureApi(apiUrl);

ReactDOM.render(<AppContainer />, document.getElementById("root"));
