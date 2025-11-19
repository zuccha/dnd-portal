import { Box, VStack } from "@chakra-ui/react";
import { useState } from "react";
import useAuth from "~/auth/use-auth";
import useAsyncLayoutEffect from "~/hooks/use-async-layout-effect";
import CampaignScreen from "./body/screens/campaign-screen/campaign-screen";
import PageSignIn from "./body/screens/sign-in-screen/page-sign-in";
import Header, { headerHeight } from "./header/header";

//------------------------------------------------------------------------------
// App
//------------------------------------------------------------------------------

export default function App() {
  const auth = useAuth();
  const [ready, setReady] = useState(false);

  useAsyncLayoutEffect(async () => {
    await Promise.all(fonts.map((font) => document.fonts.load(font)));
    await document.fonts.ready;
    setReady(true);
  }, []);

  if (!ready) return null;

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

//------------------------------------------------------------------------------
// Fonts
//------------------------------------------------------------------------------

const fonts = [
  "16px Bookinsanity",
  "bold 16px Bookinsanity",
  "italic 16px Bookinsanity",
  "italic bold 16px Bookinsanity",

  "16px Lato",
  "bold 16px Lato",
  "italic 16px Lato",
  "italic bold 16px Lato",

  "16px Mr Eaves",
];
