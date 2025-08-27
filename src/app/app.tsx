import { Box, VStack } from "@chakra-ui/react";
import useAuth from "../auth/use-auth";
import Content from "../content/content";
import PageSignIn from "./body/pages/page-sign-in/page-sign-in";
import Header, { headerHeight } from "./header/header";

//------------------------------------------------------------------------------
// App
//------------------------------------------------------------------------------

export default function App() {
  const auth = useAuth();

  return (
    <VStack gap={0} h="100vh" w="full">
      <Header />

      <Box h={`calc(100vh - ${headerHeight})`} w="full">
        {auth.user ? <Content /> : !auth.loading ? <PageSignIn /> : null}
      </Box>
    </VStack>
  );
}
