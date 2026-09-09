import { Grid, HStack, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import catalogue from "~/models/catalogue/catalogue";
import { saveSourceBundle } from "~/models/catalogue/source-bundle-indexed-db";
import { useTranslateSourceVersion } from "~/models/types/source-version";
import Button from "~/ui/button";
import SectionHeading from "~/ui/section-heading";

//------------------------------------------------------------------------------
// Sources Panel
//------------------------------------------------------------------------------

export default function SourcesPanel() {
  const { lang, t } = useI18nLangContext(i18nContext);
  const sources = catalogue.useSourceMetadataList();
  const translateSourceVersion = useTranslateSourceVersion(lang);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  const importSource = async (file: File | undefined) => {
    if (!file) return;
    setError(undefined);

    try {
      const text = await file.text();
      const bundle = await saveSourceBundle(JSON.parse(text));
      catalogue.importSourceBundle(bundle);
    } catch (e) {
      console.error(e);
      setError(t("error.import"));
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <VStack align="flex-start" flex={1} gap={6} minH="full" p={10} w="full">
      <HStack align="flex-start" justify="space-between" w="full">
        <VStack align="flex-start" gap={1}>
          <Heading>{t("title")}</Heading>
          <Text color="fg.muted">{t("subtitle")}</Text>
        </VStack>

        <Button onClick={() => inputRef.current?.click()} size="sm">
          {t("import")}
        </Button>
      </HStack>

      <Input
        accept="application/json,.json"
        display="none"
        onChange={(event) => importSource(event.target.files?.[0])}
        ref={inputRef}
        type="file"
      />

      {error && (
        <Text color="fg.error" fontSize="sm">
          {error}
        </Text>
      )}

      {sources.length ?
        <Grid
          gap={4}
          gridTemplateColumns="repeat(auto-fill, minmax(16rem, 1fr))"
          w="full"
        >
          {sources.map((source) => {
            const name = source.name[lang] || source.code;
            return (
              <VStack
                align="flex-start"
                borderWidth={1}
                gap={1}
                key={source.id}
                p={4}
                rounded="sm"
              >
                <SectionHeading>{source.code}</SectionHeading>
                <Text fontWeight="medium">{name}</Text>
                <Text color="fg.muted" fontSize="sm">
                  {t(source.type)} ·{" "}
                  {translateSourceVersion(source.version).label}
                </Text>
              </VStack>
            );
          })}
        </Grid>
      : null}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "campaign": {
    en: "Campaign",
    it: "Campagna",
  },
  "core": {
    en: "Core",
    it: "Core",
  },
  "error.import": {
    en: "The selected file is not a valid source JSON.",
    it: "Il file selezionato non è una fonte JSON valida.",
  },
  "import": {
    en: "Import",
    it: "Importa",
  },
  "module": {
    en: "Module",
    it: "Modulo",
  },
  "subtitle": {
    en: "Import, export, and remove local sources.",
    it: "Importa, esporta e rimuovi fonti locali.",
  },
  "title": {
    en: "Sources",
    it: "Fonti",
  },
};
