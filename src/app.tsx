import { Box, VStack } from "@chakra-ui/react";
import AppHeader, { appHeaderHeight } from "./app-header";
import AppSignIn from "./app-sign-in";
import Content from "./content/content";
import useAuth from "./supabase/use-auth";

//------------------------------------------------------------------------------
// App
//------------------------------------------------------------------------------

export default function App() {
  const auth = useAuth();

  return (
    <VStack gap={0} h="100vh" w="full">
      <AppHeader />

      <Box h={`calc(100vh - ${appHeaderHeight})`} w="full">
        {auth.user ? <Content /> : !auth.loading ? <AppSignIn /> : null}
      </Box>
    </VStack>
  );
}
