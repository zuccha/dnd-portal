import { useCallback } from "react";
import { createLocalStore } from "~/store/local-store";
import { type Theme, themeSchema } from "./theme";

//------------------------------------------------------------------------------
// Theme Store
//------------------------------------------------------------------------------

const themeStore = createLocalStore("theme", "light", themeSchema.parse);

const useThemeStore = themeStore.use;

//------------------------------------------------------------------------------
// Use Theme
//------------------------------------------------------------------------------

export default function useTheme(): [
  Theme,
  React.Dispatch<React.SetStateAction<Theme>>,
  () => void,
] {
  const [theme, setTheme] = useThemeStore();

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  return [theme, setTheme, toggleTheme];
}
