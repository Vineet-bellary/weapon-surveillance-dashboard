import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { LoadingProvider } from "./context/LoadingContext";
import { AlertProvider } from "./context/AlertContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoadingProvider>
      <AlertProvider>
        <App />
      </AlertProvider>
    </LoadingProvider>
  </StrictMode>,
);
