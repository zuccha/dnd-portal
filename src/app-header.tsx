import { Heading, HStack } from "@chakra-ui/react";
import type { Auth } from "./supabase/auth";
import useAuth from "./supabase/use-auth";
import ThemeButton from "./theme/theme-button";
import Button from "./ui/button";

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
        <ThemeButton />
    </HStack>
  );
}
