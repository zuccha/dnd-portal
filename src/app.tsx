import AppHeader from "./app-header";
import { useSession } from "./supabase/supabase";
import { VStack } from "@chakra-ui/react";
import AppSignIn from "./app-sign-in";
import AppSignOut from "./app-sign-out";

export default function App() {
  const session = useSession();

  return (
    <VStack minH="100vh" w="full">
      <AppHeader />

      {session ? <AppSignOut /> : <AppSignIn />}
    </VStack>
  );
}
