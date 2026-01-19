import { VStack } from "@chakra-ui/react";
import { useLayoutEffect, useState } from "react";
import { useRoute } from "../navigation/navigation";
import { Route } from "../navigation/routes";
import CampaignScreen from "./body/screens/campaign-screen/campaign-screen";
import SignInScreen from "./body/screens/sign-in-screen/sign-in-screen";
import SignUpScreen from "./body/screens/sign-up-screen/sign-up-screen";

//------------------------------------------------------------------------------
// App
//------------------------------------------------------------------------------

export default function App() {
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
      <AppRouter />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// App Router
//------------------------------------------------------------------------------

function AppRouter() {
  const route = useRoute();

  if (route === Route.SignIn) return <SignInScreen />;
  if (route === Route.SignUp) return <SignUpScreen />;
  return <CampaignScreen />;
}
