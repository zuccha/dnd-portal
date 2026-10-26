import { Box, Dialog, HStack, Portal, Tabs, Text, VStack } from "@chakra-ui/react";
import { SearchIcon } from "lucide-react";
import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import catalogue, {
  useActiveSource,
  useActiveSourceReferenceResources,
  useSources,
} from "~/models/catalogue/catalogue";
import { matchesName } from "~/models/resources/resource-filtering";
import { useTranslateResourceKind } from "~/models/types/resource-kind";
import { useTranslateSourceType } from "~/models/types/source-type";
import { Route, resourceDetailRoute } from "~/navigation/routes";
import Button from "~/ui/button";
import Input from "~/ui/input";
import { normalizeString } from "~/utils/string";
import { resourcePanelTranslations } from "../panels/panel-translations";
import { resourceKindCategoryByRoute, resourceKindSearchOptions } from "./resource-search-options";
import SearchResult from "./search-result";

type SearchMode = "resources" | "sources" | "kinds";

//------------------------------------------------------------------------------
// Resource Search
//------------------------------------------------------------------------------

export default function ResourceSearch() {
  const [lang] = useI18nLang();
  const { t } = useI18nLangContext({ ...resourcePanelTranslations, ...i18nContext });
  const navigate = useNavigate();
  const activeSource = useActiveSource();
  const resources = useActiveSourceReferenceResources();
  const sources = useSources();
  const translateKind = useTranslateResourceKind(lang);
  const translateSourceType = useTranslateSourceType(lang);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<SearchMode>("resources");
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const normalizedQuery = normalizeString(query);

  const resourceResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return resources
      .filter((resource) => matchesName(resource, normalizedQuery))
      .map((resource) => ({
        isExactMatch: Object.values(resource.name).some(
          (name) => name && normalizeString(name) === normalizedQuery,
        ),
        localizedName: resource.name[lang] || "",
        resource,
      }))
      .sort((a, b) => {
        if (a.isExactMatch !== b.isExactMatch) return a.isExactMatch ? -1 : 1;
        return a.localizedName.localeCompare(b.localizedName, lang);
      })
      .slice(0, 10)
      .map(({ resource }) => resource);
  }, [lang, normalizedQuery, resources]);

  const sourceResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return sources
      .filter((source) =>
        [source.code, ...Object.values(source.name)].some((value) =>
          normalizeString(value ?? "").includes(normalizedQuery),
        ),
      )
      .map((source) => ({
        isExactMatch: [source.code, ...Object.values(source.name)].some(
          (value) => normalizeString(value ?? "") === normalizedQuery,
        ),
        localizedName: source.name[lang] || "",
        source,
      }))
      .sort((a, b) => {
        if (a.isExactMatch !== b.isExactMatch) return a.isExactMatch ? -1 : 1;
        return a.localizedName.localeCompare(b.localizedName, lang);
      })
      .slice(0, 10)
      .map(({ source }) => source);
  }, [lang, normalizedQuery, sources]);

  const kindResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return resourceKindSearchOptions
      .filter(({ searchNames }) =>
        Object.values(searchNames).some((name) => normalizeString(name).includes(normalizedQuery)),
      )
      .map((option) => ({
        isExactMatch: normalizeString(t(option.route)) === normalizedQuery,
        option,
      }))
      .sort((a, b) => {
        if (a.isExactMatch !== b.isExactMatch) return a.isExactMatch ? -1 : 1;
        return t(a.option.route).localeCompare(t(b.option.route), lang);
      })
      .slice(0, 10)
      .map(({ option }) => option);
  }, [lang, normalizedQuery, t]);

  const resultCount =
    mode === "resources"
      ? resourceResults.length
      : mode === "sources"
        ? sourceResults.length
        : kindResults.length;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (!(event.metaKey || event.ctrlKey) || event.code !== "KeyK") return;

      const nextMode: SearchMode = event.altKey
        ? "kinds"
        : event.shiftKey
          ? "sources"
          : "resources";

      event.preventDefault();
      setMode(nextMode);
      setQuery("");
      setSelectedIndex(0);
      setOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || !resultCount) return;
    document
      .getElementById(`resource-search-result-${selectedIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, resultCount, selectedIndex]);

  //------------------------------------------------------------------------------
  // Open Search
  //------------------------------------------------------------------------------

  function openSearch(): void {
    setMode("resources");
    setQuery("");
    setSelectedIndex(0);
    setOpen(true);
  }

  //------------------------------------------------------------------------------
  // Change Search Mode
  //------------------------------------------------------------------------------

  function changeMode(nextMode: SearchMode): void {
    setMode(nextMode);
    setQuery("");
    setSelectedIndex(0);
  }

  //------------------------------------------------------------------------------
  // Open Search Result
  //------------------------------------------------------------------------------

  function openResult(index: number): void {
    if (mode === "resources") {
      const resource = resourceResults[index];
      if (!resource) return;
      setOpen(false);
      navigate(resourceDetailRoute(resource.kind, resource.id));
    } else if (mode === "sources") {
      const source = sourceResults[index];
      if (!source) return;
      catalogue.setActiveSourceId(source.id);
      setOpen(false);
    } else {
      const option = kindResults[index];
      if (!option) return;
      setOpen(false);
      navigate(option.route);
    }
  }

  //------------------------------------------------------------------------------
  // Handle Search Input Key Down
  //------------------------------------------------------------------------------

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>): void {
    if (event.key === "ArrowDown" && resultCount) {
      event.preventDefault();
      setSelectedIndex((index) => Math.min(index + 1, resultCount - 1));
    } else if (event.key === "ArrowUp" && resultCount) {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      openResult(selectedIndex);
    }
  }

  const shortcutPrefix =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

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
          {shortcutPrefix} K
        </Text>
      </Button>

      <Dialog.Root
        initialFocusEl={() => document.getElementById("global-search-input")}
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
                <Tabs.Root
                  onValueChange={({ value }) => changeMode(value as SearchMode)}
                  size="sm"
                  value={mode}
                  variant="enclosed"
                >
                  <Tabs.List mb={2} w="full">
                    <Tabs.Trigger flex={1} justifyContent="center" value="resources">
                      {t("resources")}
                      <Text color="fg.muted" fontSize="xs" ml={2} whiteSpace="nowrap">
                        {shortcutPrefix} K
                      </Text>
                    </Tabs.Trigger>
                    <Tabs.Trigger flex={1} justifyContent="center" value="sources">
                      {t("sources")}
                      <Text color="fg.muted" fontSize="xs" ml={2} whiteSpace="nowrap">
                        {shortcutPrefix} ⇧ K
                      </Text>
                    </Tabs.Trigger>
                    <Tabs.Trigger flex={1} justifyContent="center" value="kinds">
                      {t("kinds")}
                      <Text color="fg.muted" fontSize="xs" ml={2} whiteSpace="nowrap">
                        {shortcutPrefix} ⌥ K
                      </Text>
                    </Tabs.Trigger>
                  </Tabs.List>
                </Tabs.Root>
                <Input
                  autoFocus
                  aria-activedescendant={
                    resultCount ? `resource-search-result-${selectedIndex}` : undefined
                  }
                  aria-controls="resource-search-results"
                  aria-expanded={open}
                  id="global-search-input"
                  role="combobox"
                  groupProps={{ startElement: <SearchIcon size={16} /> }}
                  onKeyDown={onInputKeyDown}
                  onValueChange={(value) => {
                    setQuery(value);
                    setSelectedIndex(0);
                  }}
                  placeholder={t(`${mode}_placeholder`)}
                  value={query}
                />
              </Dialog.Body>
              <Box maxH="calc(75vh - 9rem)" overflowY="auto" pb={2} pt={1} px={2}>
                {!normalizedQuery ? (
                  <Text color="fg.muted" px={2} py={3}>
                    {t(activeSource || mode !== "resources" ? "start_typing" : "no_active_source")}
                  </Text>
                ) : resultCount === 0 ? (
                  <Text color="fg.muted" px={2} py={3}>
                    {t("no_results")}
                  </Text>
                ) : (
                  <VStack align="stretch" gap={1} id="resource-search-results" role="listbox">
                    {mode === "resources" &&
                      resourceResults.map((resource, index) => (
                        <SearchResult
                          index={index}
                          key={`${resource.kind}:${resource.id}`}
                          kind={translateKind(resource.kind)}
                          name={resource.name[lang] || ""}
                          onClick={() => openResult(index)}
                          onMouseMove={() => setSelectedIndex(index)}
                          selected={selectedIndex === index}
                          source={resource.source_code}
                        />
                      ))}
                    {mode === "sources" &&
                      sourceResults.map((source, index) => (
                        <SearchResult
                          index={index}
                          key={source.id}
                          kind={translateSourceType(source.type)}
                          name={source.name[lang] || ""}
                          onClick={() => openResult(index)}
                          onMouseMove={() => setSelectedIndex(index)}
                          selected={selectedIndex === index}
                          source={source.code}
                        />
                      ))}
                    {mode === "kinds" &&
                      kindResults.map(({ kind, route }, index) => (
                        <SearchResult
                          index={index}
                          key={kind}
                          kind={t(resourceKindCategoryByRoute[route] ?? Route.Resources)}
                          name={t(route)}
                          onClick={() => openResult(index)}
                          onMouseMove={() => setSelectedIndex(index)}
                          selected={selectedIndex === index}
                        />
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
  kinds: { en: "Types", it: "Tipi" },
  no_active_source: {
    en: "Select a source before searching resources.",
    it: "Seleziona una fonte prima di cercare risorse.",
  },
  no_results: {
    en: "No matching results found.",
    it: "Nessun risultato corrispondente.",
  },
  resources: { en: "Resources", it: "Risorse" },
  resources_placeholder: {
    en: "Search by resource name...",
    it: "Cerca per nome della risorsa...",
  },
  sources: { en: "Sources", it: "Fonti" },
  sources_placeholder: {
    en: "Search sources by name or code...",
    it: "Cerca fonti per nome o codice...",
  },
  start_typing: { en: "Start typing to search.", it: "Inizia a digitare per cercare." },
  trigger: { en: "Search resources...", it: "Cerca risorse..." },
  kinds_placeholder: {
    en: "Search resource types...",
    it: "Cerca tipi di risorsa...",
  },
};
