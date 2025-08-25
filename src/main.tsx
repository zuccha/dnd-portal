import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import { AuthProvider } from "./supabase/auth-provider";
import { queryClient } from "./supabase/supabase";
import { ThemeProvider } from "./theme/theme-provider";

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
