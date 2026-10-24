import { HStack, Menu, Portal } from "@chakra-ui/react";
import { EllipsisIcon, MoonIcon, SunIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { signOut } from "~/auth/auth";
import useAuth from "~/auth/use-auth";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { Route } from "~/navigation/routes";
import useTheme from "~/theme/use-theme";
import IconButton from "~/ui/icon-button";

//------------------------------------------------------------------------------
// Topbar Actions Menu
//------------------------------------------------------------------------------

export default function TopbarActionsMenu() {
  const user = useAuth().user;
  const { t } = useI18nLangContext(i18nContext);
  const navigate = useNavigate();
  const [theme, _setColorMode, toggleTheme] = useTheme();
  const ThemeIcon = theme === "dark" ? MoonIcon : SunIcon;

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton Icon={EllipsisIcon} label={t("menu")} size="sm" variant="ghost" />
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item onClick={toggleTheme} value="theme">
              <HStack>
                <ThemeIcon size={16} />
                <span>{theme === "dark" ? t("theme.light") : t("theme.dark")}</span>
              </HStack>
            </Menu.Item>
            <Menu.Separator />
            {user ? (
              <Menu.Item onClick={signOut} value="signout">
                {t("button.signout")}
              </Menu.Item>
            ) : (
              <>
                <Menu.Item onClick={() => navigate(Route.SignIn)} value="signin">
                  {t("button.signin")}
                </Menu.Item>
                <Menu.Item onClick={() => navigate(Route.SignUp)} value="signup">
                  {t("button.signup")}
                </Menu.Item>
              </>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "button.signin": {
    en: "Sign in",
    it: "Login",
  },
  "button.signout": {
    en: "Sign out",
    it: "Logout",
  },
  "button.signup": {
    en: "Register",
    it: "Registrati",
  },
  "menu": {
    en: "Menu",
    it: "Menu",
  },
  "theme.dark": {
    en: "Switch to dark theme",
    it: "Passa al tema scuro",
  },
  "theme.light": {
    en: "Switch to light theme",
    it: "Passa al tema chiaro",
  },
};
