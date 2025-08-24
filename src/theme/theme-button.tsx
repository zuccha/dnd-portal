import { IconButton } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "lucide-react";
import useTheme from "./use-theme";

//------------------------------------------------------------------------------
// Theme Button
//------------------------------------------------------------------------------

export default function ThemeButton() {
  const [theme, _setColorMode, toggleTheme] = useTheme();
  return (
    <IconButton
      aria-label="Toggle color mode"
      onClick={toggleTheme}
      size="sm"
      variant="ghost"
    >
      {theme === "dark" ? <MoonIcon /> : <SunIcon />}
    </IconButton>
  );
}
