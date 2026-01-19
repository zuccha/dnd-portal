import { VStack } from "@chakra-ui/react";
import { useLayoutEffect, useState } from "react";
import useAuth from "~/auth/use-auth";
import CampaignScreen from "./body/screens/campaign-screen/campaign-screen";
import SignInScreen from "./body/screens/sign-in-screen/sign-in-screen";

//------------------------------------------------------------------------------
// App
//------------------------------------------------------------------------------

export default function App() {
  const auth = useAuth();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    Promise.all([
      document.fonts.load('16px "Bookinsanity"'),
      document.fonts.load('italic 16px "Bookinsanity"'),
      document.fonts.load('bold 16px "Bookinsanity"'),
      document.fonts.load('bold italic 16px "Bookinsanity"'),
      document.fonts.load('16px "Mr Eaves"'),
      document.fonts.load('16px "Mr Eaves Alt"'),
    ]).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <VStack gap={0} h="100vh" w="full">
      {auth.user ?
        <CampaignScreen />
      : !auth.loading ?
        <SignInScreen />
      : null}
    </VStack>
  );
}
