import { useCallback } from "react";
import { createLocalStore } from "../store/local-store";
import { type Theme, themeSchema } from "./theme";

const themeStore = createLocalStore("theme", "light", themeSchema.parse);

export default function useTheme(): [
  Theme,
  React.Dispatch<React.SetStateAction<Theme>>,
  () => void
] {
  const [theme, setTheme] = themeStore.use();

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  return [theme, setTheme, toggleTheme];
}
