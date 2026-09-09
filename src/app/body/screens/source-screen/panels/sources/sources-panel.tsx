import { Box, HStack, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import catalogue from "~/models/catalogue/catalogue";
import {
  deleteSourceBundle,
  saveSourceBundle,
} from "~/models/catalogue/source-bundle-indexed-db";
import { type SourceMetadata, useSelectedSourceId } from "~/models/sources";
import type { SourceType } from "~/models/types/source-type";
import { useTranslateSourceVersion } from "~/models/types/source-version";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";

//------------------------------------------------------------------------------
// Sources Panel
//------------------------------------------------------------------------------

export default function SourcesPanel() {
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const sources = catalogue.useSourceMetadataList();
  const translateSourceVersion = useTranslateSourceVersion(lang);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [selectedSourceId, setSelectedSourceId] = useSelectedSourceId();
  const sourceGroups = groupSourcesByType(sources, lang);

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

  const removeSource = async (sourceId: string) => {
    const source = sources.find((source) => source.id === sourceId);
    if (!source) return;

    const ok = confirm(ti("remove.confirm", source.code));
    if (!ok) return;

    setError(undefined);

    try {
      await deleteSourceBundle(sourceId);
      catalogue.removeSourceBundle(sourceId);
      if (selectedSourceId === sourceId) setSelectedSourceId(undefined);
    } catch (e) {
      console.error(e);
      setError(t("error.remove"));
    }
  };

  return (
    <Box bgColor="bg.subtle" h="full" w="full">
      <VStack flex={1} gap={6} h="full" overflow="auto" p={10} w="full">
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
          <VStack gap={5} w="full">
            {sourceGroups.map(({ sources, type }) => (
              <VStack align="flex-start" gap={2} key={type} w="full">
                <Text color="fg.muted" fontSize="sm" fontWeight="semibold">
                  {t(type)}
                </Text>

                <VStack gap={2} w="full">
                  {sources.map((source) => {
                    const name = source.name[lang] || source.code;
                    return (
                      <HStack
                        bgColor="bg"
                        borderRadius="sm"
                        borderWidth={1}
                        gap={3}
                        key={source.id}
                        minH={14}
                        px={3}
                        py={2}
                        w="full"
                      >
                        <VStack align="flex-start" flex={1} gap={0}>
                          <Text fontWeight="semibold" truncate>
                            {name}
                          </Text>
                          <Text color="fg.muted" fontSize="sm" truncate>
                            {source.code} ·{" "}
                            {translateSourceVersion(source.version).label}
                          </Text>
                        </VStack>

                        <IconButton
                          Icon={Trash2Icon}
                          colorPalette="red"
                          label={t("remove")}
                          onClick={() => removeSource(source.id)}
                          size="xs"
                          variant="ghost"
                        />
                      </HStack>
                    );
                  })}
                </VStack>
              </VStack>
            ))}
          </VStack>
        : null}
      </VStack>
    </Box>
  );
}

//------------------------------------------------------------------------------
// Group Sources By Type
//------------------------------------------------------------------------------

function groupSourcesByType(
  sources: SourceMetadata[],
  lang: string,
): { sources: SourceMetadata[]; type: SourceType }[] {
  const sourceTypes: SourceType[] = ["core", "module", "campaign"];

  return sourceTypes.flatMap((type) => {
    const groupSources = sources
      .filter((source) => source.type === type)
      .sort((a, b) => {
        const nameA = a.name[lang] || a.code;
        const nameB = b.name[lang] || b.code;
        return nameA.localeCompare(nameB) || a.code.localeCompare(b.code);
      });

    return groupSources.length ? [{ sources: groupSources, type }] : [];
  });
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
  "error.remove": {
    en: "The selected source could not be removed.",
    it: "La fonte selezionata non può essere rimossa.",
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
  "remove.confirm": {
    en: "Remove <1> from this device?",
    it: "Rimuovere <1> da questo dispositivo?",
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
