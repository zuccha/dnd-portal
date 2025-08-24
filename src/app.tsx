import { VStack } from "@chakra-ui/react";
import AppHeader from "./app-header";
import AppSignIn from "./app-sign-in";
import useAuth from "./supabase/use-auth";

//------------------------------------------------------------------------------
// App
//------------------------------------------------------------------------------

export default function App() {
  const auth = useAuth();

  return (
    <VStack minH="100vh" w="full">
      <AppHeader />

      {auth.user || auth.loading ? null : <AppSignIn />}
    </VStack>
  );
}
