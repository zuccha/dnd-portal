import { Heading, HStack } from "@chakra-ui/react";
import ThemeButton from "./theme/theme-button";
import { useSession } from "./supabase/supabase";

export default function AppHeader() {
  const session = useSession();

  return (
    <HStack
      justify="space-between"
      px={4}
      py={2}
      shadow={session ? "sm" : undefined}
      w="full"
    >
      <Heading size="lg">D&D</Heading>
      <ThemeButton />
    </HStack>
  );
}
