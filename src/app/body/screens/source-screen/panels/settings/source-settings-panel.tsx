import { Box, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import catalogue from "~/models/catalogue/catalogue";
import type { Source, SourceDependency } from "~/models/catalogue/source";
import { useTranslateSourceVersion } from "~/models/types/source-version";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import Search, { type SearchRefObject } from "~/ui/search";
import SectionHeading from "~/ui/section-heading";
import { hash } from "~/utils/hash";
import { compareObjects } from "~/utils/object";
import { normalizeString } from "~/utils/string";

//------------------------------------------------------------------------------
// SourceSettings Panel
//------------------------------------------------------------------------------

export default function SourceSettingsPanel() {
  const { lang, t } = useI18nLangContext(i18nContext);
  const source = catalogue.useActiveSource();
  const sources = catalogue.useSources();

  if (!source)
    return (
      <SourceSettingsRoot>
        <Heading>{t("title")}</Heading>
        <Text color="fg.muted">{t("no_source")}</Text>
      </SourceSettingsRoot>
    );

  return (
    <SourceSettingsRoot>
      <VStack align="flex-start" gap={1} w="full">
        <Heading>{t("title")}</Heading>
        <Text color="fg.muted">
          {source.code}
          {source.name[lang] ? ` - ${source.name[lang]}` : ""}
        </Text>
      </VStack>

      <SourceDependenciesSettings
        initialDependencies={source}
        key={hash(source)}
        source={source}
        sources={sources}
      />
    </SourceSettingsRoot>
  );
}

//------------------------------------------------------------------------------
// Source Dependencies Settings
//------------------------------------------------------------------------------

type SourceDependencies = Pick<Source, "includes" | "requires">;

type SourceDependenciesSettingsProps = {
  initialDependencies: SourceDependencies;
  source: Source;
  sources: Source[];
};

function SourceDependenciesSettings({
  initialDependencies,
  source,
  sources,
}: SourceDependenciesSettingsProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [draft, setDraft] = useState<SourceDependencies>(
    sourceToDependencies(initialDependencies),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const initialDraft = sourceToDependencies(initialDependencies);
  const changed = hash(draft) !== hash(initialDraft);

  const reset = useCallback(() => {
    setDraft(sourceToDependencies(initialDependencies));
    setError(undefined);
  }, [initialDependencies]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(undefined);
    try {
      await catalogue.updateSource(source.id, (source) => ({
        ...source,
        ...draft,
      }));
    } catch (e) {
      console.error(e);
      setError("error.save");
    } finally {
      setSaving(false);
    }
  }, [draft, source.id]);

  const setIncludes = useCallback((includes: SourceDependency[]) => {
    setDraft((prev) => ({ ...prev, includes }));
    setError(undefined);
  }, []);

  const setRequires = useCallback((requires: SourceDependency[]) => {
    setDraft((prev) => ({ ...prev, requires }));
    setError(undefined);
  }, []);

  return (
    <VStack align="flex-start" gap={8} w="full">
      <SourceDependencyEditor
        dependencies={draft.includes}
        disabled={saving}
        label={t("includes")}
        onDependenciesChange={setIncludes}
        otherDependencies={draft.requires}
        placeholder={t("add_include")}
        sourceId={source.id}
        sources={sources}
      />

      <SourceDependencyEditor
        dependencies={draft.requires}
        disabled={saving}
        label={t("requires")}
        onDependenciesChange={setRequires}
        otherDependencies={draft.includes}
        placeholder={t("add_require")}
        sourceId={source.id}
        sources={sources}
      />

      {error && (
        <Text color="fg.error" fontSize="sm">
          {t(error)}
        </Text>
      )}

      <HStack justify="flex-end" w="full">
        <Button
          disabled={!changed || saving}
          onClick={reset}
          size="sm"
          variant="outline"
        >
          {t("reset")}
        </Button>
        <Button
          disabled={!changed || saving}
          loading={saving}
          onClick={save}
          size="sm"
        >
          {t("save")}
        </Button>
      </HStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Source Settings Root
//------------------------------------------------------------------------------

function SourceSettingsRoot({ children }: { children: React.ReactNode }) {
  return (
    <VStack
      align="flex-start"
      // bgColor="bg.subtle"
      flex={1}
      gap={6}
      maxW="36rem"
      minH="full"
      px={10}
      py={10}
      w="full"
    >
      {children}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Source Dependency Editor
//------------------------------------------------------------------------------

type SourceDependencyEditorProps = {
  dependencies: SourceDependency[];
  disabled: boolean;
  label: string;
  onDependenciesChange: (dependencies: SourceDependency[]) => void;
  otherDependencies: SourceDependency[];
  placeholder: string;
  sourceId: string;
  sources: Source[];
};

function SourceDependencyEditor({
  dependencies,
  disabled,
  label,
  onDependenciesChange,
  otherDependencies,
  placeholder,
  sourceId,
  sources,
}: SourceDependencyEditorProps) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const searchRef = useRef<SearchRefObject>(null);

  const translateSourceVersion = useTranslateSourceVersion(lang);

  const selectedIds = useMemo(
    () =>
      new Set(
        [...dependencies, ...otherDependencies].map(
          ({ source_id }) => source_id,
        ),
      ),
    [dependencies, otherDependencies],
  );

  const options = useMemo(() => {
    return sources
      .filter((source) => source.id !== sourceId)
      .filter((source) => !selectedIds.has(source.id))
      .map((source) => sourceToOption(source, lang))
      .sort(compareObjects("label"));
  }, [lang, selectedIds, sourceId, sources]);

  const selectedSources = useMemo(() => {
    return dependencies.sort(compareObjects("code"));
  }, [dependencies]);

  const addSource = useCallback(
    (id: string) => {
      if (!id || dependencies.some(({ source_id }) => source_id === id)) return;

      const source = sources.find((source) => source.id === id);
      if (!source) return;

      onDependenciesChange([...dependencies, sourceToDependency(source)]);
      searchRef.current?.clear();
      searchRef.current?.focus();
    },
    [dependencies, onDependenciesChange, sources],
  );

  const removeSource = useCallback(
    (id: string) =>
      onDependenciesChange(
        dependencies.filter(({ source_id }) => source_id !== id),
      ),
    [dependencies, onDependenciesChange],
  );

  return (
    <VStack align="flex-start" gap={3} w="full">
      <SectionHeading>{label}</SectionHeading>

      <Search
        disabled={disabled || !options.length}
        emptyLabel={t("empty")}
        onFilter={filterSourceOption}
        onValueChange={addSource}
        options={options}
        placeholder={placeholder}
        ref={searchRef}
        size="sm"
        w="full"
      />

      {selectedSources.length ?
        <VStack align="stretch" gap={1.5} w="full">
          {selectedSources.map((dependency) => (
            <HStack
              bgColor="bg"
              borderRadius="sm"
              borderWidth={1}
              key={dependency.source_id}
              minH={9}
              px={3}
              py={1}
              w="full"
            >
              <Box flex={1} minW={0}>
                <Text fontSize="sm" fontWeight="medium" truncate>
                  {dependency.code}
                  {dependency.name[lang] ? ` - ${dependency.name[lang]}` : ""}
                </Text>
                <Text color="fg.muted" fontSize="xs">
                  {translateSourceVersion(dependency.version).label}
                </Text>
              </Box>

              <IconButton
                Icon={XIcon}
                disabled={disabled}
                label={t("remove")}
                onClick={() => removeSource(dependency.source_id)}
                size="xs"
                variant="ghost"
              />
            </HStack>
          ))}
        </VStack>
      : <Text color="fg.muted" fontSize="sm">
          {t("none")}
        </Text>
      }
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Source Options
//------------------------------------------------------------------------------

type SourceOption = {
  label: string;
  search: string;
  value: string;
};

function sourceToOption(source: Source, lang: string): SourceOption {
  const name = source.name[lang] ?? "";
  const label = name ? `${source.code} - ${name}` : source.code;
  return {
    label,
    search: normalizeString(`${source.code} ${name} ${source.version}`),
    value: source.id,
  };
}

function sourceToDependency(source: Source): SourceDependency {
  return {
    code: source.code,
    name: source.name,
    registry_source_id: source.registry?.source_id,
    source_id: source.id,
    version: source.version,
  };
}

function filterSourceOption(option: SourceOption, search: string): boolean {
  return option.search.includes(normalizeString(search));
}

//------------------------------------------------------------------------------
// Source Dependencies
//------------------------------------------------------------------------------

function sourceToDependencies(source: SourceDependencies): SourceDependencies {
  return {
    includes: source.includes,
    requires: source.requires,
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "add_include": {
    en: "Add included source",
    it: "Aggiungi fonte inclusa",
  },
  "add_require": {
    en: "Add required source",
    it: "Aggiungi fonte richiesta",
  },
  "empty": {
    en: "No sources found",
    it: "Nessuna fonte trovata",
  },
  "error.save": {
    en: "Could not save source relationships",
    it: "Impossibile salvare le relazioni della fonte",
  },
  "includes": {
    en: "Includes",
    it: "Include",
  },
  "no_source": {
    en: "No source selected",
    it: "Nessuna fonte selezionata",
  },
  "none": {
    en: "No sources selected",
    it: "Nessuna fonte selezionata",
  },
  "remove": {
    en: "Remove",
    it: "Rimuovi",
  },
  "requires": {
    en: "Requires",
    it: "Richiede",
  },
  "reset": {
    en: "Reset",
    it: "Ripristina",
  },
  "save": {
    en: "Save",
    it: "Salva",
  },
  "title": {
    en: "Source Settings",
    it: "Impostazioni del Modulo",
  },
};
