import { Button, Center } from "@chakra-ui/react";
import { signOut } from "./supabase/auth";

//------------------------------------------------------------------------------
// App Sign Out
//------------------------------------------------------------------------------

export default function AppSignOut() {
  return (
    <Center flex={1}>
      <Button onClick={signOut}>Sign out</Button>
    </Center>
  );
}
