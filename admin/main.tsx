import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../src/styles.css";
import { AdminApp } from "../src/screens/bachpanse/lms/admin-app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);
