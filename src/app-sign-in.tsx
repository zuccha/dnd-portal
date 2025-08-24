import { Center, Heading, VStack, chakra } from "@chakra-ui/react";
import RawDiscordIcon from "./assets/images/icons/discord.svg?react";
import { signInWithDiscord } from "./supabase/auth";
import Button from "./ui/button";

//------------------------------------------------------------------------------
// App Sign In
//------------------------------------------------------------------------------

export default function AppSignIn() {
  return (
    <Center>
      <VStack flex={1} gap={10} mt={20}>
        <VStack align="flex-start" gap={0}>
          <Heading size="2xl">Welcome.</Heading>
          <Heading color="fg.subtle" size="2xl">
            Please, sign in to use the app.
          </Heading>
        </VStack>
        <Button
          borderColor="bg.inverted"
          onClick={signInWithDiscord}
          variant="outline"
          w="full"
        >
          <DiscordIcon />
          Continue with Discord
        </Button>
      </VStack>
    </Center>
  );
}

//------------------------------------------------------------------------------
// Discord Icon
//------------------------------------------------------------------------------

const DiscordIcon = chakra(RawDiscordIcon);
