import { Box, HStack, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import {
  type Source,
  type SourceRelations,
  defaultSourceRelations,
  updateSourceRelations,
  useCanAdminSource,
  useSelectedSource,
  useSourceRelations,
  useSources,
} from "~/models/sources";
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
  const source = useSelectedSource();
  const sourceId = source?.id ?? "";
  const canAdmin = useCanAdminSource(sourceId);
  const sources = useSources();
  const relations = useSourceRelations(sourceId);

  const loading = sources.isLoading || relations.isLoading;

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

      {loading ?
        <HStack color="fg.muted">
          <Spinner size="sm" />
          <Text>{t("loading")}</Text>
        </HStack>
      : <SourceRelationsSettings
          canAdmin={canAdmin}
          initialRelations={relations.data ?? defaultSourceRelations}
          key={hash(relations.data ?? defaultSourceRelations)}
          source={source}
          sources={sources.data ?? []}
        />
      }
    </SourceSettingsRoot>
  );
}

//------------------------------------------------------------------------------
// Source Relations Settings
//------------------------------------------------------------------------------

type SourceRelationsSettingsProps = {
  canAdmin: boolean;
  initialRelations: SourceRelations;
  source: Source;
  sources: Source[];
};

function SourceRelationsSettings({
  canAdmin,
  initialRelations,
  source,
  sources,
}: SourceRelationsSettingsProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [draft, setDraft] = useState<SourceRelations>(initialRelations);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const sourceById = useMemo(() => {
    const entries = sources.map((source) => [source.id, source] as const);
    return new Map(entries);
  }, [sources]);

  const changed = hash(draft) !== hash(initialRelations);

  const reset = useCallback(() => {
    setDraft(initialRelations);
    setError(undefined);
  }, [initialRelations]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(undefined);
    try {
      await updateSourceRelations(source.id, draft);
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
      {!canAdmin && (
        <Text color="fg.muted" fontSize="sm">
          {t("read_only")}
        </Text>
      )}

      <SourceRelationEditor
        disabled={!canAdmin || saving}
        ids={draft.include_ids}
        label={t("includes")}
        onIdsChange={setIncludeIds}
        otherIds={draft.required_ids}
        placeholder={t("add_include")}
        sourceById={sourceById}
        sourceId={source.id}
        sources={sources}
      />

      <SourceRelationEditor
        disabled={!canAdmin || saving}
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
          disabled={!canAdmin || !changed || saving}
          onClick={reset}
          size="sm"
          variant="outline"
        >
          {t("reset")}
        </Button>
        <Button
          disabled={!canAdmin || !changed || saving}
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
// Source Relation Editor
//------------------------------------------------------------------------------

type SourceRelationEditorProps = {
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

function SourceRelationEditor({
  disabled,
  ids,
  label,
  onIdsChange,
  otherIds,
  placeholder,
  sourceById,
  sourceId,
  sources,
}: SourceRelationEditorProps) {
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
  "loading": {
    en: "Loading source relationships",
    it: "Caricamento delle relazioni della fonte",
  },
  "no_source": {
    en: "No source selected",
    it: "Nessuna fonte selezionata",
  },
  "none": {
    en: "No sources selected",
    it: "Nessuna fonte selezionata",
  },
  "read_only": {
    en: "You can view these relationships, but only source admins can edit them.",
    it: "Puoi visualizzare queste relazioni, ma solo gli amministratori della fonte possono modificarle.",
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
