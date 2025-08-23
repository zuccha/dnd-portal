import { Center, chakra, Heading, VStack } from "@chakra-ui/react";
import { signInWithDiscord } from "./supabase/supabase";
import RawDiscordIcon from "./assets/images/icons/discord.svg?react";
import Button from "./ui/button";

export default function AppSignIn() {
  return (
    <Center>
      <VStack flex={1} mt={20} gap={10}>
        <VStack align="flex-start" gap={0}>
          <Heading size="2xl">Welcome.</Heading>
          <Heading color="fg.subtle" size="2xl">
            Please, sign in to use the app.
          </Heading>
        </VStack>
        <Button onClick={signInWithDiscord} variant="outline" w="full">
          <DiscordIcon />
          Continue with Discord
        </Button>
      </VStack>
    </Center>
  );
}

const DiscordIcon = chakra(RawDiscordIcon);
