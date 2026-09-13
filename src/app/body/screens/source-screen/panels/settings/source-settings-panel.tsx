import {
  Box,
  HStack,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import catalogue from "~/models/catalogue/catalogue";
import type { Source, SourceDependency } from "~/models/catalogue/source";
import { updateRegistrySourceVisibility } from "~/models/registry/registry";
import {
  type SourceType,
  useSourceTypeOptions,
  useTranslateSourceType,
} from "~/models/types/source-type";
import {
  type SourceVersion,
  useSourceVersionTranslations,
  useTranslateSourceVersion,
} from "~/models/types/source-version";
import Button from "~/ui/button";
import CaptionInput from "~/ui/caption-input";
import IconButton from "~/ui/icon-button";
import TextInput from "~/ui/input";
import Search, { type SearchRefObject } from "~/ui/search";
import SectionHeading from "~/ui/section-heading";
import Select from "~/ui/select";
import { hash } from "~/utils/hash";
import { compareObjects } from "~/utils/object";
import { normalizeString } from "~/utils/string";
import SourceAccessPanel from "./source-access-panel";
import SourceRegistrySettings from "./source-registry-settings";

//------------------------------------------------------------------------------
// Source Settings Panel
//------------------------------------------------------------------------------

export type SourceSettingsPanelProps = {
  sourceId: string;
};

export default function SourceSettingsPanel({
  sourceId,
}: SourceSettingsPanelProps) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const source = catalogue.useSource(sourceId);
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

      <SourceSettingsForm
        initialSource={source}
        key={hash(source)}
        source={source}
        sources={sources}
      />
    </SourceSettingsRoot>
  );
}

//------------------------------------------------------------------------------
// Source Settings Form
//------------------------------------------------------------------------------

type SourceSettingsDraft = Pick<
  Source,
  "code" | "includes" | "name" | "requires" | "type" | "version"
> & { visibility: "public" | "private" };

type SourceSettingsFormProps = {
  initialSource: Source;
  source: Source;
  sources: Source[];
};

function SourceSettingsForm({
  initialSource,
  source,
  sources,
}: SourceSettingsFormProps) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const sourceEditable = catalogue.useSourceEditable(source.id);
  const sourceTypeOptions = useSourceTypeOptions();
  const sourceVersionOptions = useSourceVersionTranslations();
  const [draft, setDraft] = useState<SourceSettingsDraft>(
    sourceToSettingsDraft(initialSource),
  );
  const [saving, setSaving] = useState(false);
  const [detaching, setDetaching] = useState(false);
  const [error, setError] = useState<string>();

  const initialDraft = sourceToSettingsDraft(initialSource);
  const changed = hash(draft) !== hash(initialDraft);

  const reset = useCallback(() => {
    setDraft(sourceToSettingsDraft(initialSource));
    setError(undefined);
  }, [initialSource]);

  const save = useCallback(async () => {
    if (!sourceEditable) return;

    setSaving(true);
    setError(undefined);
    try {
      const { visibility, ...sourceDraft } = draft;
      if (
        source.registry?.access === "creator" &&
        visibility !== (source.registry.visibility ?? "private")
      )
        await updateRegistrySourceVisibility(source.id, visibility);

      await catalogue.updateSource(source.id, (source) => ({
        ...source,
        ...sourceDraft,
        registry:
          source.registry ? { ...source.registry, visibility } : undefined,
      }));
    } catch (e) {
      console.error(e);
      setError("error.save");
    } finally {
      setSaving(false);
    }
  }, [draft, source.id, source.registry, sourceEditable]);

  const detach = useCallback(async () => {
    if (sourceEditable || !confirm(t("detach_confirm"))) return;

    setDetaching(true);
    setError(undefined);
    try {
      await catalogue.detachSource(source.id);
    } catch (e) {
      console.error(e);
      setError("error.detach");
    } finally {
      setDetaching(false);
    }
  }, [source.id, sourceEditable, t]);

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
      {!sourceEditable && (
        <Box
          bgColor="bg.muted"
          borderColor="border"
          borderRadius="sm"
          borderWidth={1}
          px={3}
          py={2}
          w="full"
        >
          <HStack justify="space-between">
            <Text color="fg.muted" fontSize="sm">
              {t("readonly")}
            </Text>
            <Button
              loading={detaching}
              onClick={detach}
              size="sm"
              variant="outline"
            >
              {t("make_local")}
            </Button>
          </HStack>
        </Box>
      )}

      <VStack align="flex-start" gap={4} w="full">
        <SectionHeading>{t("metadata")}</SectionHeading>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4} w="full">
          <CaptionInput caption={t("name")} w="full">
            <TextInput
              disabled={saving || !sourceEditable}
              onValueChange={(name) =>
                setDraft((prev) => ({
                  ...prev,
                  name: { ...prev.name, [lang]: name || null },
                }))
              }
              size="sm"
              value={draft.name[lang] ?? ""}
            />
          </CaptionInput>

          <CaptionInput caption={t("code")} w="full">
            <TextInput
              disabled={saving || !sourceEditable}
              onValueChange={(code) =>
                setDraft((prev) => ({
                  ...prev,
                  code,
                }))
              }
              size="sm"
              value={draft.code}
            />
          </CaptionInput>

          <CaptionInput caption={t("type")} w="full">
            <Select.Enum<SourceType>
              disabled={saving || !sourceEditable}
              onValueChange={(type) =>
                setDraft((prev) => ({
                  ...prev,
                  type,
                }))
              }
              options={sourceTypeOptions}
              size="sm"
              value={draft.type}
            />
          </CaptionInput>

          <CaptionInput caption={t("version")} w="full">
            <Select.Enum<SourceVersion>
              disabled={saving || !sourceEditable}
              onValueChange={(version) =>
                setDraft((prev) => ({
                  ...prev,
                  version,
                }))
              }
              options={sourceVersionOptions}
              size="sm"
              value={draft.version}
            />
          </CaptionInput>
        </SimpleGrid>
      </VStack>

      <SourceDependencyEditor
        dependencies={draft.includes}
        disabled={saving || !sourceEditable}
        label={t("includes")}
        onDependenciesChange={setIncludes}
        otherDependencies={draft.requires}
        placeholder={t("add_include")}
        sourceId={source.id}
        sources={sources}
      />

      <SourceDependencyEditor
        dependencies={draft.requires}
        disabled={saving || !sourceEditable}
        label={t("requires")}
        onDependenciesChange={setRequires}
        otherDependencies={draft.includes}
        placeholder={t("add_require")}
        sourceId={source.id}
        sources={sources}
      />

      {source.registry?.access === "creator" && (
        <SourceAccessPanel source={source} />
      )}

      {source.registry?.access === "creator" && (
        <SourceRegistrySettings
          disabled={saving || !sourceEditable}
          onVisibilityChange={(visibility) =>
            setDraft((prev) => ({ ...prev, visibility }))
          }
          visibility={draft.visibility}
        />
      )}

      {error && (
        <Text color="fg.error" fontSize="sm">
          {t(error)}
        </Text>
      )}

      <HStack justify="flex-end" w="full">
        <Button
          disabled={!changed || saving || !sourceEditable}
          onClick={reset}
          size="sm"
          variant="outline"
        >
          {t("reset")}
        </Button>
        <Button
          disabled={!changed || saving || !sourceEditable}
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
      flex={1}
      gap={6}
      h="full"
      overflow="auto"
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

  const translateSourceType = useTranslateSourceType(lang);
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

  const categories = useMemo(() => {
    const sourceTypes: SourceType[] = ["core", "module", "campaign"];

    return sourceTypes.flatMap((type) => {
      const items = options.filter((option) => option.type === type);
      return items.length ?
          [{ id: type, items, title: translateSourceType(type).label }]
        : [];
    });
  }, [options, translateSourceType]);

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
        categories={categories}
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
  type: SourceType;
  value: string;
};

function sourceToOption(source: Source, lang: string): SourceOption {
  const name = source.name[lang] ?? "";
  const label = name ? `${source.code} - ${name}` : source.code;
  return {
    label,
    search: normalizeString(`${source.code} ${name} ${source.version}`),
    type: source.type,
    value: source.id,
  };
}

function sourceToDependency(source: Source): SourceDependency {
  return {
    code: source.code,
    name: source.name,
    source_id: source.id,
    version: source.version,
  };
}

function filterSourceOption(option: SourceOption, search: string): boolean {
  return option.search.includes(normalizeString(search));
}

//------------------------------------------------------------------------------
// Source Settings Draft
//------------------------------------------------------------------------------

function sourceToSettingsDraft(source: Source): SourceSettingsDraft {
  return {
    code: source.code,
    includes: source.includes,
    name: source.name,
    requires: source.requires,
    type: source.type,
    version: source.version,
    visibility: source.registry?.visibility ?? "private",
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
  "code": {
    en: "Code",
    it: "Codice",
  },
  "detach_confirm": {
    en: "Make this official source local? It will no longer receive registry updates on this device.",
    it: "Rendere locale questa fonte ufficiale? Non riceverà più aggiornamenti dal registro su questo dispositivo.",
  },
  "empty": {
    en: "No sources found",
    it: "Nessuna fonte trovata",
  },
  "error.detach": {
    en: "Could not make the source local",
    it: "Impossibile rendere locale la fonte",
  },
  "error.save": {
    en: "Could not save source settings",
    it: "Impossibile salvare le impostazioni della fonte",
  },
  "includes": {
    en: "Includes",
    it: "Include",
  },
  "make_local": {
    en: "Make local",
    it: "Rendi locale",
  },
  "metadata": {
    en: "Details",
    it: "Dettagli",
  },
  "name": {
    en: "Name",
    it: "Nome",
  },
  "no_source": {
    en: "No source selected",
    it: "Nessuna fonte selezionata",
  },
  "none": {
    en: "No sources selected",
    it: "Nessuna fonte selezionata",
  },
  "readonly": {
    en: "This registry source is read-only on this device.",
    it: "Questa fonte del registro è in sola lettura su questo dispositivo.",
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
  "type": {
    en: "Type",
    it: "Tipo",
  },
  "version": {
    en: "Version",
    it: "Versione",
  },
};
