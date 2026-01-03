import { Box, VStack } from "@chakra-ui/react";
import useAuth from "~/auth/use-auth";
import CampaignScreen from "./body/screens/campaign-screen/campaign-screen";
import PageSignIn from "./body/screens/sign-in-screen/page-sign-in";
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
        {auth.user ?
          <CampaignScreen />
        : !auth.loading ?
          <PageSignIn />
        : null}
      </Box>
    </VStack>
  );
}
