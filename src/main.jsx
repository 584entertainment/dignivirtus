import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/landing.css";
import App from "./App.jsx";
import { AppProvider } from "./engine/store.jsx";
import { AuthProvider } from "./lib/auth.jsx";
import { RouterProvider } from "./router.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </RouterProvider>
  </StrictMode>,
);
