import { Box, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import catalogue from "~/models/catalogue/catalogue";
import type { Source } from "~/models/catalogue/source";
import { updateSourceBundle } from "~/models/catalogue/source-bundle-indexed-db";
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

type SourceDependencies = Pick<Source, "include_ids" | "required_ids">;

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

  const sourceById = useMemo(() => {
    const entries = sources.map((source) => [source.id, source] as const);
    return new Map(entries);
  }, [sources]);

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
      await updateSourceDependencies(source.id, draft);
    } catch (e) {
      console.error(e);
      setError("error.save");
    } finally {
      setSaving(false);
    }
  }, [draft, source.id]);

  const setIncludeIds = useCallback((include_ids: string[]) => {
    setDraft((prev) => ({ ...prev, include_ids }));
    setError(undefined);
  }, []);

  const setRequiredIds = useCallback((required_ids: string[]) => {
    setDraft((prev) => ({ ...prev, required_ids }));
    setError(undefined);
  }, []);

  return (
    <VStack align="flex-start" gap={8} w="full">
      <SourceDependencyEditor
        disabled={saving}
        ids={draft.include_ids}
        label={t("includes")}
        onIdsChange={setIncludeIds}
        otherIds={draft.required_ids}
        placeholder={t("add_include")}
        sourceById={sourceById}
        sourceId={source.id}
        sources={sources}
      />

      <SourceDependencyEditor
        disabled={saving}
        ids={draft.required_ids}
        label={t("requires")}
        onIdsChange={setRequiredIds}
        otherIds={draft.include_ids}
        placeholder={t("add_require")}
        sourceById={sourceById}
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
  disabled: boolean;
  ids: string[];
  label: string;
  onIdsChange: (ids: string[]) => void;
  otherIds: string[];
  placeholder: string;
  sourceById: Map<string, Source>;
  sourceId: string;
  sources: Source[];
};

function SourceDependencyEditor({
  disabled,
  ids,
  label,
  onIdsChange,
  otherIds,
  placeholder,
  sourceById,
  sourceId,
  sources,
}: SourceDependencyEditorProps) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const searchRef = useRef<SearchRefObject>(null);

  const translateSourceVersion = useTranslateSourceVersion(lang);

  const selectedIds = useMemo(
    () => new Set([...ids, ...otherIds]),
    [ids, otherIds],
  );

  const options = useMemo(() => {
    return sources
      .filter((source) => source.id !== sourceId)
      .filter((source) => !selectedIds.has(source.id))
      .map((source) => sourceToOption(source, lang))
      .sort(compareObjects("label"));
  }, [lang, selectedIds, sourceId, sources]);

  const selectedSources = useMemo(() => {
    return ids
      .map((id) => sourceById.get(id))
      .filter((source): source is Source => !!source)
      .sort(compareObjects("code"));
  }, [ids, sourceById]);

  const addSource = useCallback(
    (id: string) => {
      if (!id || ids.includes(id)) return;
      onIdsChange([...ids, id]);
      searchRef.current?.clear();
      searchRef.current?.focus();
    },
    [ids, onIdsChange],
  );

  const removeSource = useCallback(
    (id: string) => onIdsChange(ids.filter((otherId) => otherId !== id)),
    [ids, onIdsChange],
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
          {selectedSources.map((source) => (
            <HStack
              bgColor="bg"
              borderRadius="sm"
              borderWidth={1}
              key={source.id}
              minH={9}
              px={3}
              py={1}
              w="full"
            >
              <Box flex={1} minW={0}>
                <Text fontSize="sm" fontWeight="medium" truncate>
                  {source.code}
                  {source.name[lang] ? ` - ${source.name[lang]}` : ""}
                </Text>
                <Text color="fg.muted" fontSize="xs">
                  {translateSourceVersion(source.version).label}
                </Text>
              </Box>

              <IconButton
                Icon={XIcon}
                disabled={disabled}
                label={t("remove")}
                onClick={() => removeSource(source.id)}
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

function filterSourceOption(option: SourceOption, search: string): boolean {
  return option.search.includes(normalizeString(search));
}

//------------------------------------------------------------------------------
// Source Dependencies
//------------------------------------------------------------------------------

function sourceToDependencies(source: SourceDependencies): SourceDependencies {
  return {
    include_ids: source.include_ids,
    required_ids: source.required_ids,
  };
}

async function updateSourceDependencies(
  sourceId: string,
  dependencies: SourceDependencies,
): Promise<void> {
  const bundle = await updateSourceBundle(sourceId, (bundle) => ({
    ...bundle,
    source: {
      ...bundle.source,
      ...dependencies,
    },
  }));

  catalogue.importSourceBundle(bundle, {
    activate: catalogue.getActiveSourceId() === sourceId,
  });
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
