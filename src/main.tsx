import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./components/App";
import { applyStoredTheme } from "./lib/theme";
import "./styles/base.css";
import "./styles/catalog.css";
import "./styles/creator-source.css";
import "./styles/design-improvements.css";
import "./styles/privacy-policy.css";
import "./styles/prelaunch.css";
import "./styles/search-suggestions.css";
import "./styles/support.css";

applyStoredTheme();

ReactDOM.createRoot(document.getElementById("root") ?? document.body).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
