import { Avatar, HStack, Heading, Menu, Portal } from "@chakra-ui/react";
import { type AuthUser, signOut } from "./supabase/auth";
import useAuth from "./supabase/use-auth";
import ThemeButton from "./theme/theme-button";

//------------------------------------------------------------------------------
// App Header
//------------------------------------------------------------------------------

export default function AppHeader() {
  const auth = useAuth();

  return (
    <HStack
      justify="space-between"
      px={4}
      py={2}
      shadow={auth.user ? "sm" : undefined}
      w="full"
    >
      <Heading size="lg">D&D</Heading>

      <HStack>
        {auth.user && <UserButton user={auth.user} />}
        <ThemeButton />
      </HStack>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// User Button
//------------------------------------------------------------------------------

function UserButton({ user }: { user: AuthUser }) {
  return (
    <Menu.Root>
      <Menu.Trigger focusRing="outside" rounded="full">
        <Avatar.Root size="xs">
          <Avatar.Fallback name={user.name} />
          <Avatar.Image src={user.avatarUrl} />
        </Avatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>{user.name ?? "User"}</Menu.ItemGroupLabel>
              <Menu.Item onClick={signOut} value="logout">
                Sign out
              </Menu.Item>
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
