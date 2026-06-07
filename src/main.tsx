import React from "react";
import ReactDOM from "react-dom/client";
import { RecipeCatalogPage } from "./components/RecipeCatalogPage";
import "./styles/base.css";
import "./styles/catalog.css";

ReactDOM.createRoot(document.getElementById("root") ?? document.body).render(
  <React.StrictMode>
    <RecipeCatalogPage />
  </React.StrictMode>,
);
