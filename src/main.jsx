import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AllRoutes from "./routes/AllRoutes.jsx";
import { AppProviders } from "./contexts/index.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProviders>
      <AllRoutes />
    </AppProviders>
  </StrictMode>
);
