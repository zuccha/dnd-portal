import { Button, Center } from "@chakra-ui/react";
import { signInWithDiscord } from "./supabase/supabase";

export default function AppSignIn() {
  return (
    <Center flex={1}>
      <Button onClick={signInWithDiscord}>Sign up with Discord</Button>
    </Center>
  );
}
