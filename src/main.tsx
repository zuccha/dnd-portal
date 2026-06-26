import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/app.tsx";
import { AuthProvider } from "./auth/auth-provider.tsx";
import { queryClient } from "./supabase.ts";
import { ThemeProvider } from "./theme/theme-provider";
import { Toaster } from "./ui/toaster";
import "./theme/fonts.css";

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

        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
