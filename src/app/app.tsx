import { VStack } from "@chakra-ui/react";
import { useLayoutEffect, useState } from "react";
import catalogue from "~/models/catalogue/catalogue";
import {
  loadSourceBundles,
  loadSourceStates,
} from "~/models/catalogue/source-bundle-indexed-db";
import {
  downloadDefaultSource,
  updateInstalledSources,
} from "~/models/catalogue/source-bundle-sync";
import { useRoute } from "../navigation/navigation";
import { Route } from "../navigation/routes";
import { autoUpdateSourcesStore } from "./app-settings";
import SignInScreen from "./body/screens/sign-in-screen/sign-in-screen";
import SignUpScreen from "./body/screens/sign-up-screen/sign-up-screen";
import SourceScreen from "./body/screens/source-screen/source-screen";

//------------------------------------------------------------------------------
// App
//------------------------------------------------------------------------------

export default function App() {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;

    async function initializeApp(): Promise<void> {
      const [bundles, states] = await Promise.all([
        loadSourceBundles().catch((error) => {
          console.error("Unable to load persisted source bundles", error);
          return [];
        }),
        loadSourceStates().catch((error) => {
          console.error("Unable to load persisted source states", error);
          return [];
        }),
        document.fonts.load('16px "Bookinsanity"'),
        document.fonts.load('italic 16px "Bookinsanity"'),
        document.fonts.load('bold 16px "Bookinsanity"'),
        document.fonts.load('bold italic 16px "Bookinsanity"'),
        document.fonts.load('16px "Fira Mono"'),
        document.fonts.load('bold 16px "Fira Mono"'),
        document.fonts.load('16px "Mr Eaves"'),
        document.fonts.load('16px "Mr Eaves Alt"'),
        document.fonts.load('16px "Title Wave"'),
      ]);

      if (cancelled) return;

      for (const bundle of bundles)
        catalogue.importSourceBundle(bundle, { activate: false });
      for (const state of states) catalogue.setSourceState(state);

      if (!localStorage.getItem("initialized")) {
        if (!bundles.length) {
          try {
            await downloadDefaultSource(
              import.meta.env["VITE_DEFAULT_SOURCE_ID"],
            );
            localStorage.setItem("initialized", "true");
          } catch (error) {
            console.error("Unable to download the default source", error);
          }
        } else {
          localStorage.setItem("initialized", "true");
        }
      }

      if (autoUpdateSourcesStore.get() && bundles.length)
        void updateInstalledSources(bundles, states);

      const activeSourceId = catalogue.getActiveSourceId();
      if (activeSourceId)
        catalogue.setActiveSourceId(
          catalogue.getSource(activeSourceId) ? activeSourceId : undefined,
        );

      setReady(true);
    }

    void initializeApp();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  return (
    <VStack gap={0} h="100vh" overflow="hidden" w="full">
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
  return <SourceScreen />;
}
