"use client";

import { ChakraProvider, ClientOnly, defaultSystem, Theme as ChakraTheme } from "@chakra-ui/react";
import useTheme from "./use-theme";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Theme Provider
//------------------------------------------------------------------------------

export type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme] = useTheme();

  return (
    <ChakraProvider value={defaultSystem}>
      <ChakraTheme appearance={theme}>
        <ClientOnly>{children}</ClientOnly>
      </ChakraTheme>
    </ChakraProvider>
  );
}
