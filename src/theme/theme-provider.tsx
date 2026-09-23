"use client";

import { ChakraProvider, ClientOnly, defaultSystem, Theme as ChakraTheme } from "@chakra-ui/react";
import { type ReactNode, useLayoutEffect } from "react";
import useTheme from "./use-theme";

//------------------------------------------------------------------------------
// Theme Provider
//------------------------------------------------------------------------------

export type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme] = useTheme();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ChakraProvider value={defaultSystem}>
      <ChakraTheme appearance={theme}>
        <ClientOnly>{children}</ClientOnly>
      </ChakraTheme>
    </ChakraProvider>
  );
}
