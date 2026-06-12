import { HStack, Menu, Portal, VStack } from "@chakra-ui/react";
import { MenuIcon } from "lucide-react";
import { signOut } from "~/auth/auth";
import useAuth from "~/auth/use-auth";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { Route } from "~/navigation/routes";
import IconButton from "~/ui/icon-button";
import LanguageSelect from "./language-select";
import SystemSelect from "./system-select";

export default function I18nButton() {
  const user = useAuth().user;
  const { t } = useI18nLangContext(i18nContext);

  return (
    <>
      <HStack display={{ base: "none", md: "flex" }} ml={2.5}>
        <LanguageSelect />
        <SystemSelect />
      </HStack>

      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton
            Icon={MenuIcon}
            aria-label="Settings"
            display={{ base: "inline-flex", md: "none" }}
            size="sm"
            variant="ghost"
          />
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {user ?
                <Menu.Item onClick={signOut} value="signout">
                  {t("button.signout")}
                </Menu.Item>
              : <Menu.ItemGroup>
                  <Menu.Item
                    onClick={() => history.pushState({}, "", Route.SignIn)}
                    value="signin"
                  >
                    {t("button.signin")}
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => history.pushState({}, "", Route.SignUp)}
                    value="signup"
                  >
                    {t("button.signup")}
                  </Menu.Item>
                </Menu.ItemGroup>
              }

              <Menu.Separator />

              <VStack gap={1} mb={1} mt={2.5} mx={1}>
                <LanguageSelect w="full" />
                <SystemSelect w="full" />
              </VStack>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </>
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
};
