import { Box, Dialog, HStack, Portal, Text, VStack } from "@chakra-ui/react";
import { useEffect, useId, useMemo, useState } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Resource } from "~/models/resources/resource";
import { matchesName } from "~/models/resources/resource-filtering";
import { useTranslateResourceKind } from "~/models/types/resource-kind";
import Button from "~/ui/button";
import Input from "~/ui/input";
import { normalizeString } from "~/utils/string";

//------------------------------------------------------------------------------
// Resource Link Search Dialog Props
//------------------------------------------------------------------------------

type ResourceLinkSearchDialogProps = {
  initialQuery: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (resource: Resource) => void;
  open: boolean;
  resources: Resource[];
};

//------------------------------------------------------------------------------
// Resource Link Search Dialog
//------------------------------------------------------------------------------

export default function ResourceLinkSearchDialog({
  initialQuery,
  onOpenChange,
  onSelect,
  open,
  resources,
}: ResourceLinkSearchDialogProps) {
  const id = useId();
  const inputId = `resource-link-search-input-${id}`;
  const resultsId = `resource-link-search-results-${id}`;
  const [lang] = useI18nLang();
  const { t } = useI18nLangContext(i18nContext);
  const translateKind = useTranslateResourceKind(lang);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const normalizedQuery = normalizeString(query);
  const results = useMemo(
    () =>
      resources
        .filter((resource) => matchesName(resource, normalizedQuery))
        .sort((a, b) => getLocalizedName(a, lang).localeCompare(getLocalizedName(b, lang), lang))
        .slice(0, 10),
    [lang, normalizedQuery, resources],
  );

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setSelectedIndex(0);
  }, [initialQuery, open]);

  useEffect(() => {
    if (!open || !results.length) return;
    document.getElementById(`${resultsId}-${selectedIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [open, results.length, resultsId, selectedIndex]);

  function selectResult(index: number): void {
    const resource = results[index];
    if (!resource) return;
    onOpenChange(false);
    requestAnimationFrame(() => onSelect(resource));
  }

  return (
    <Dialog.Root
      initialFocusEl={() => document.getElementById(inputId)}
      lazyMount
      onOpenChange={({ open: nextOpen }) => onOpenChange(nextOpen)}
      open={open}
      size="md"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner
          alignItems="flex-start"
          justifyContent="center"
          pt={{ base: "10vh", md: "15vh" }}
        >
          <Dialog.Content maxH="75vh" overflow="hidden" w="calc(100vw - 2rem)">
            <Dialog.Body px={2} pb={0} pt={2}>
              <Input
                aria-activedescendant={results.length ? `${resultsId}-${selectedIndex}` : undefined}
                aria-controls={resultsId}
                aria-expanded={open}
                autoFocus
                id={inputId}
                role="combobox"
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" && results.length) {
                    event.preventDefault();
                    setSelectedIndex((index) => Math.min(index + 1, results.length - 1));
                  } else if (event.key === "ArrowUp" && results.length) {
                    event.preventDefault();
                    setSelectedIndex((index) => Math.max(index - 1, 0));
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    selectResult(selectedIndex);
                  }
                }}
                onValueChange={(value) => {
                  setQuery(value);
                  setSelectedIndex(0);
                }}
                placeholder={t("search")}
                value={query}
              />
            </Dialog.Body>
            <Box maxH="calc(75vh - 5rem)" overflowY="auto" pb={2} pt={1} px={2}>
              {!normalizedQuery ? (
                <Text color="fg.muted" px={2} py={3}>
                  {t(resources.length ? "start_typing" : "no_resources")}
                </Text>
              ) : results.length === 0 ? (
                <Text color="fg.muted" px={2} py={3}>
                  {t("no_results")}
                </Text>
              ) : (
                <VStack align="stretch" gap={1} id={resultsId} role="listbox">
                  {results.map((resource, index) => (
                    <Button
                      alignItems="center"
                      aria-selected={selectedIndex === index}
                      h="4em"
                      id={`${resultsId}-${index}`}
                      key={`${resource.kind}:${resource.id}`}
                      onClick={() => selectResult(index)}
                      onMouseMove={() => setSelectedIndex(index)}
                      py={4}
                      role="option"
                      textAlign="left"
                      variant={selectedIndex === index ? "subtle" : "ghost"}
                      w="full"
                    >
                      <HStack align="center" justify="space-between" minW={0} w="full">
                        <VStack align="stretch" gap={0} minW={0}>
                          <Text
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace={{ base: "normal", sm: "nowrap" }}
                          >
                            {getLocalizedName(resource, lang)}
                          </Text>
                          <Text color="fg.muted" fontSize="xs" lineHeight="shorter">
                            {resource.source_code}
                          </Text>
                        </VStack>
                        <Text color="fg.muted" flexShrink={0} fontSize="sm">
                          {translateKind(resource.kind)}
                        </Text>
                      </HStack>
                    </Button>
                  ))}
                </VStack>
              )}
            </Box>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

//------------------------------------------------------------------------------
// Get Localized Name
//------------------------------------------------------------------------------

function getLocalizedName(resource: Resource, lang: string): string {
  return resource.name[lang] || resource.name["en"] || resource.name["it"] || "";
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  no_resources: {
    en: "No accessible resources are available.",
    it: "Non ci sono risorse accessibili.",
  },
  no_results: {
    en: "No matching resources found.",
    it: "Nessuna risorsa corrispondente trovata.",
  },
  search: {
    en: "Search resources...",
    it: "Cerca risorse...",
  },
  start_typing: {
    en: "Start typing to search resources.",
    it: "Inizia a digitare per cercare risorse.",
  },
};
