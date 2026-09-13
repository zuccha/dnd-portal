import { VStack } from "@chakra-ui/react";
import { useLayoutEffect, useState } from "react";
import catalogue from "~/models/catalogue/catalogue";
import {
  loadSourceBundles,
  loadSourceStates,
  saveSourceBundle,
} from "~/models/catalogue/source-bundle-indexed-db";
import {
  fetchRegistrySourceBundles,
  fetchRegistrySources,
} from "~/models/registry/registry";
import { useRoute } from "../navigation/navigation";
import { Route } from "../navigation/routes";
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

      if (!localStorage.getItem("initialized") && !bundles.length) {
        try {
          await downloadDefaultSource();
          localStorage.setItem("initialized", "true");
        } catch (error) {
          console.error("Unable to download the default source", error);
        }
      }

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
// Download Default Source
//------------------------------------------------------------------------------

async function downloadDefaultSource(): Promise<void> {
  const sourceId = import.meta.env["VITE_DEFAULT_SOURCE_ID"];
  if (!sourceId) throw new Error("VITE_DEFAULT_SOURCE_ID is not configured");

  const sources = await fetchRegistrySources();
  const source = sources.find(({ id }) => id === sourceId);
  if (!source) throw new Error(`Default source not found: ${sourceId}`);

  const [bundle] = await fetchRegistrySourceBundles([source.id]);
  if (!bundle) throw new Error(`Default bundle not found: ${source.id}`);

  const savedBundle = await saveSourceBundle({
    ...bundle,
    source: {
      ...bundle.source,
      registry: source.registry,
    },
  });
  catalogue.importSourceBundle(savedBundle);
  catalogue.setActiveSourceId(savedBundle.source.id);
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
