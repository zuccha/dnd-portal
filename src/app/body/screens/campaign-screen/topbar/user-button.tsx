import { Avatar, HStack, Menu, Portal } from "@chakra-ui/react";
import { signOut } from "~/auth/auth";
import useAuth from "~/auth/use-auth";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { Route } from "~/navigation/routes";
import Link from "~/ui/link";

//------------------------------------------------------------------------------
// User Button
//------------------------------------------------------------------------------

export default function UserButton() {
  const user = useAuth().user;
  const { t } = useI18nLangContext(i18nContext);

  if (!user)
    return (
      <HStack fontSize="sm" w="full">
        <Link onClick={() => history.pushState({}, "", Route.SignIn)}>
          {t("button.signin")}
        </Link>
        /
        <Link onClick={() => history.pushState({}, "", Route.SignUp)}>
          {t("button.signup")}
        </Link>
      </HStack>
    );

  return (
    <Menu.Root>
      <Menu.Trigger focusRing="outside" rounded="full">
        <Avatar.Root cursor="pointer" size="2xs">
          <Avatar.Fallback name={user.name} />
          <Avatar.Image src={user.avatarUrl} />
        </Avatar.Root>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item onClick={signOut} value="signout">
              {t("button.signout")}
            </Menu.Item>
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
};
