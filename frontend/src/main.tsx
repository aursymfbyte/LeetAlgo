import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { recordVisit } from "./lib/api";
import { getToken } from "./lib/auth";
import { getVisitorId } from "./lib/visitor";
import "./styles.css";

const isAdmin = getToken() !== null;
if (!isAdmin) {
  recordVisit(getVisitorId());
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
