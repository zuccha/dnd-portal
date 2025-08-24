import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import { ThemeProvider } from "./theme/theme-provider";
import { AuthProvider } from "./supabase/auth-provider";

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
