import { Avatar, HStack, Menu, Portal } from "@chakra-ui/react";
import { EllipsisIcon } from "lucide-react";
import { signOut } from "~/auth/auth";
import useAuth from "~/auth/use-auth";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { Route } from "~/navigation/routes";
import IconButton from "~/ui/icon-button";
import Link from "~/ui/link";

//------------------------------------------------------------------------------
// User Button
//------------------------------------------------------------------------------

export default function UserButton() {
  const user = useAuth().user;
  const { t } = useI18nLangContext(i18nContext);

  if (!user)
    return (
      <>
        <HStack display={{ base: "none", md: "flex" }} fontSize="sm" mx={2.5}>
          <Link onClick={() => history.pushState({}, "", Route.SignIn)}>
            {t("button.signin")}
          </Link>
          /
          <Link onClick={() => history.pushState({}, "", Route.SignUp)}>
            {t("button.signup")}
          </Link>
        </HStack>

        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton
              Icon={EllipsisIcon}
              aria-label="Settings"
              display={{ base: "inline-flex", md: "none" }}
              size="sm"
              variant="ghost"
            />
          </Menu.Trigger>

          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.ItemGroup>
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
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </>
    );

  return (
    <Menu.Root>
      <Menu.Trigger
        display={{ base: "none", md: "inline-flex" }}
        focusRing="outside"
        mx={2.5}
        rounded="full"
      >
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
