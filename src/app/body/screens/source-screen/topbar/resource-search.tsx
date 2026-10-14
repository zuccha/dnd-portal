import { Box, Dialog, HStack, Portal, Text, VStack } from "@chakra-ui/react";
import { SearchIcon } from "lucide-react";
import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useActiveSource, useActiveSourceReferenceResources } from "~/models/catalogue/catalogue";
import type { Resource } from "~/models/resources/resource";
import { matchesName } from "~/models/resources/resource-filtering";
import { useTranslateResourceKind } from "~/models/types/resource-kind";
import { resourceDetailRoute } from "~/navigation/routes";
import Button from "~/ui/button";
import Input from "~/ui/input";
import { normalizeString } from "~/utils/string";

//------------------------------------------------------------------------------
// Resource Search
//------------------------------------------------------------------------------

export default function ResourceSearch() {
  const [lang] = useI18nLang();
  const { t } = useI18nLangContext(i18nContext);
  const navigate = useNavigate();
  const activeSource = useActiveSource();
  const resources = useActiveSourceReferenceResources();
  const translateKind = useTranslateResourceKind(lang);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const normalizedQuery = normalizeString(query);

  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    return resources
      .filter((resource) => matchesName(resource, normalizedQuery))
      .sort((a, b) => {
        const aName = a.name[lang] ?? Object.values(a.name).find(Boolean) ?? "";
        const bName = b.name[lang] ?? Object.values(b.name).find(Boolean) ?? "";
        return aName.localeCompare(bName, lang);
      })
      .slice(0, 10);
  }, [lang, normalizedQuery, resources]);

  useEffect(() => {
    //------------------------------------------------------------------------------
    // Handle Global Search Shortcut
    //------------------------------------------------------------------------------

    function onKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((wasOpen) => !wasOpen);
        setQuery("");
        setSelectedIndex(0);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open && results.length) {
      document
        .getElementById(`resource-search-result-${selectedIndex}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [open, results.length, selectedIndex]);

  //------------------------------------------------------------------------------
  // Open Search
  //------------------------------------------------------------------------------

  function openSearch(): void {
    setQuery("");
    setSelectedIndex(0);
    setOpen(true);
  }

  //------------------------------------------------------------------------------
  // Open Resource
  //------------------------------------------------------------------------------

  function openResource(resource: Resource): void {
    setOpen(false);
    navigate(resourceDetailRoute(resource.kind, resource.id));
  }

  //------------------------------------------------------------------------------
  // Handle Search Input Key Down
  //------------------------------------------------------------------------------

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>): void {
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setSelectedIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[selectedIndex]) {
      event.preventDefault();
      openResource(results[selectedIndex]);
    }
  }

  const shortcut =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
      ? "⌘ K"
      : "Ctrl K";

  return (
    <>
      <Button
        _hover={{ bgColor: "bg.emphasized" }}
        aria-haspopup="dialog"
        bgColor="bg.muted"
        flex="1"
        justifyContent="space-between"
        justifySelf="center"
        maxW="20rem"
        minW={0}
        onClick={openSearch}
        size="sm"
        variant="outline"
        w="full"
      >
        <HStack color="fg.muted" minW={0}>
          <SearchIcon size={16} />
          <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {t("trigger")}
          </Text>
        </HStack>
        <Text color="fg.muted" display={{ base: "none", sm: "block" }} fontSize="xs">
          {shortcut}
        </Text>
      </Button>

      <Dialog.Root
        lazyMount
        onOpenChange={({ open: nextOpen }) => setOpen(nextOpen)}
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
                  autoFocus
                  aria-activedescendant={
                    results[selectedIndex] ? `resource-search-result-${selectedIndex}` : undefined
                  }
                  aria-controls="resource-search-results"
                  aria-expanded={open}
                  role="combobox"
                  groupProps={{ startElement: <SearchIcon size={16} /> }}
                  onKeyDown={onInputKeyDown}
                  onValueChange={(value) => {
                    setQuery(value);
                    setSelectedIndex(0);
                  }}
                  placeholder={t("placeholder")}
                  value={query}
                />
              </Dialog.Body>
              <Box maxH="calc(75vh - 7rem)" overflowY="auto" pb={2} pt={1} px={2}>
                {!normalizedQuery ? (
                  <Text color="fg.muted" px={2} py={3}>
                    {t(activeSource ? "start_typing" : "no_active_source")}
                  </Text>
                ) : results.length === 0 ? (
                  <Text color="fg.muted" px={2} py={3}>
                    {t("no_results")}
                  </Text>
                ) : (
                  <VStack align="stretch" gap={1} id="resource-search-results" role="listbox">
                    {results.map((resource, index) => (
                      <Button
                        alignItems="center"
                        aria-selected={selectedIndex === index}
                        id={`resource-search-result-${index}`}
                        key={`${resource.kind}:${resource.id}`}
                        h="4em"
                        onClick={() => openResource(resource)}
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
                              textAlign="left"
                              textOverflow="ellipsis"
                              whiteSpace={{ base: "normal", sm: "nowrap" }}
                            >
                              {resource.name[lang] ??
                                Object.values(resource.name).find(Boolean) ??
                                ""}
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
    </>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  no_active_source: {
    en: "Select a source before searching.",
    it: "Seleziona una fonte prima di cercare.",
  },
  no_results: {
    en: "No matching resources found.",
    it: "Nessuna risorsa corrispondente.",
  },
  placeholder: {
    en: "Search by resource name...",
    it: "Cerca per nome della risorsa...",
  },
  start_typing: {
    en: "Type a resource name to search the active source and its dependencies.",
    it: "Digita il nome di una risorsa per cercare nella fonte attiva e nelle sue dipendenze.",
  },
  trigger: {
    en: "Search resources...",
    it: "Cerca risorse...",
  },
};
