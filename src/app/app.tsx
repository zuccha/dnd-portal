import { Center, Span, Spinner, Text, VStack } from "@chakra-ui/react";
import { useLayoutEffect, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import catalogue from "~/models/catalogue/catalogue";
import { loadSourceBundles, loadSourceStates } from "~/models/catalogue/source-bundle-indexed-db";
import {
  downloadDefaultSource,
  updateInstalledSources,
} from "~/models/catalogue/source-bundle-sync";
import AppRouter from "./app-router";
import { autoUpdateSourcesStore } from "./app-settings";

//------------------------------------------------------------------------------
// App
//------------------------------------------------------------------------------

export default function App() {
  const { t } = useI18nLangContext(i18nContext);
  const [downloadingDefaultSource, setDownloadingDefaultSource] = useState(false);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;

    async function initializeApp(): Promise<void> {
      const [bundles] = await Promise.all([
        loadSourceBundles().catch((error) => {
          console.error("Unable to load persisted source bundles", error);
          return [];
        }),
        document.fonts.load('16px "Bookinsanity"'),
        document.fonts.load('italic 16px "Bookinsanity"'),
        document.fonts.load('bold 16px "Bookinsanity"'),
        document.fonts.load('bold italic 16px "Bookinsanity"'),
        document.fonts.load('16px "Fira Mono"'),
        document.fonts.load('bold 16px "Fira Mono"'),
        document.fonts.load('16px "Mitr"'),
        document.fonts.load('500 16px "Mitr"'),
        document.fonts.load('600 16px "Mitr"'),
        document.fonts.load('16px "Mr Eaves Alt"'),
        document.fonts.load('16px "Title Wave"'),
      ]);
      const states = await loadSourceStates().catch((error) => {
        console.error("Unable to load persisted source states", error);
        return [];
      });

      if (cancelled) return;

      for (const bundle of bundles) catalogue.importSourceBundle(bundle, { activate: false });
      for (const state of states) catalogue.setSourceState(state);

      if (!localStorage.getItem("initialized")) {
        if (!bundles.length) {
          if (!cancelled) setDownloadingDefaultSource(true);
          try {
            await downloadDefaultSource(import.meta.env["VITE_DEFAULT_SOURCE_ID"]);
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

  if (!ready)
    return (
      <Center h="100vh" w="full">
        <VStack gap={4}>
          <Text fontFamily="Mitr" fontSize="3xl" fontWeight="600">
            <Span>Zorbo</Span>
            <Span color="fg.error" fontWeight="500">
              DnD
            </Span>
          </Text>
          <Spinner
            aria-label={t(downloadingDefaultSource ? "downloading_srd" : "loading")}
            size="xl"
          />
          <Text color="fg.muted" fontSize="sm">
            {t(downloadingDefaultSource ? "downloading_srd" : "loading")}
          </Text>
        </VStack>
      </Center>
    );

  return (
    <VStack gap={0} h="100vh" overflow="hidden" w="full">
      <AppRouter />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  downloading_srd: {
    en: "Downloading SRD…",
    it: "Download della SRD…",
  },
  loading: {
    en: "Loading…",
    it: "Caricamento…",
  },
};
