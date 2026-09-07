import { HStack, Heading, Input, Text, VStack } from "@chakra-ui/react";
// import { DownloadIcon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
// import { useSelectedSourceId } from "~/models/sources";
// import {
//   deleteLocalSourceBundle,
//   importLocalSourceBundle,
//   useLocalSourceBundles,
// } from "~/models/sources/source-catalogue";
// import { useTranslateSourceVersion } from "~/models/types/source-version";
import Button from "~/ui/button";
// import IconButton from "~/ui/icon-button";
// import SectionHeading from "~/ui/section-heading";
// import { downloadFile } from "~/utils/download";

//------------------------------------------------------------------------------
// Sources Panel
//------------------------------------------------------------------------------

export default function SourcesPanel() {
  const { t } = useI18nLangContext(i18nContext);
  // const bundles = useLocalSourceBundles();
  // const [selectedSourceId, setSelectedSourceId] = useSelectedSourceId();
  // const translateSourceVersion = useTranslateSourceVersion(lang);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  const importSource = async (file: File | undefined) => {
    if (!file) return;
    setError(undefined);

    try {
      // const text = await file.text();
      // await importLocalSourceBundle(JSON.parse(text));
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

      {/* {bundles.length ?
        <Grid
          gap={4}
          gridTemplateColumns="repeat(auto-fill, minmax(16rem, 1fr))"
          w="full"
        >
          {bundles.map((bundle) => {
            const name = bundle.source.name[lang] || bundle.source.code;
            return (
              <VStack
                align="flex-start"
                borderWidth={1}
                gap={4}
                key={bundle.source.id}
                p={4}
                rounded="md"
              >
                <VStack align="flex-start" gap={1} w="full">
                  <SectionHeading>{bundle.source.code}</SectionHeading>
                  <Text fontWeight="medium">{name}</Text>
                  <Text color="fg.muted" fontSize="sm">
                    {t(bundle.source.type)} ·{" "}
                    {translateSourceVersion(bundle.source.version).label}
                  </Text>
                </VStack>

                <HStack justify="flex-end" w="full">
                  <IconButton
                    Icon={DownloadIcon}
                    label={t("export")}
                    onClick={() =>
                      downloadFile(
                        JSON.stringify(bundle, null, 2),
                        `${bundle.source.code}.json`,
                        "json",
                      )
                    }
                    size="sm"
                    variant="ghost"
                  />
                  <IconButton
                    Icon={Trash2Icon}
                    label={t("remove")}
                    onClick={() => {
                      deleteLocalSourceBundle(bundle.source.id);
                      if (selectedSourceId === bundle.source.id)
                        setSelectedSourceId(undefined);
                    }}
                    size="sm"
                    variant="ghost"
                  />
                </HStack>
              </VStack>
            );
          })}
        </Grid>
      : null} */}
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
  "export": {
    en: "Export",
    it: "Esporta",
  },
  "import": {
    en: "Import",
    it: "Importa",
  },
  "module": {
    en: "Module",
    it: "Modulo",
  },
  "remove": {
    en: "Remove",
    it: "Rimuovi",
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
