import { MoonIcon, SunIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import IconButton from "~/ui/icon-button";
import useTheme from "./use-theme";

//------------------------------------------------------------------------------
// Theme Button
//------------------------------------------------------------------------------

export default function ThemeButton() {
  const { t } = useI18nLangContext(i18nContext);
  const [theme, _setColorMode, toggleTheme] = useTheme();
  return (
    <IconButton
      Icon={theme === "dark" ? MoonIcon : SunIcon}
      label={theme === "dark" ? t("light") : t("dark")}
      onClick={toggleTheme}
      size="sm"
      variant="ghost"
    />
  );
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  dark: {
    en: "Switch to dark theme",
    it: "Passa a tema scuro",
  },
  light: {
    en: "Switch to light theme",
    it: "Passa a tema chiaro",
  },
};
