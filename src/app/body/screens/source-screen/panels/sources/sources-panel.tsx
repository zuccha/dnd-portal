import {
  Badge,
  Box,
  CloseButton,
  Dialog,
  HStack,
  Heading,
  Input,
  Portal,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { DownloadIcon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import catalogue from "~/models/catalogue/catalogue";
import type { Source } from "~/models/catalogue/source";
import type { SourceBundle } from "~/models/catalogue/source-bundle";
import {
  deleteSourceBundle,
  saveSourceBundle,
} from "~/models/catalogue/source-bundle-indexed-db";
import type { SourceType } from "~/models/types/source-type";
import { useTranslateSourceVersion } from "~/models/types/source-version";
import { Route } from "~/navigation/routes";
import Button from "~/ui/button";
import Checkbox from "~/ui/checkbox";
import IconButton from "~/ui/icon-button";
import { downloadFile } from "~/utils/download";
import SourceCreateDialog from "./source-create-dialog";

//------------------------------------------------------------------------------
// Sources Panel
//------------------------------------------------------------------------------

export default function SourcesPanel() {
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const sources = catalogue.useSources();
  const translateSourceVersion = useTranslateSourceVersion(lang);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [exportSource, setExportSource] = useState<Source>();
  const [includePrivate, setIncludePrivate] = useState(true);
  const localSourceGroups = groupSourcesByType(
    sources.filter((source) => !source.registry),
    lang,
  );
  const officialSourceGroups = groupSourcesByType(
    sources.filter((source) => source.registry),
    lang,
  );

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

  const createSource = async (bundle: SourceBundle) => {
    if (!bundle.source.code || !bundle.source.name[lang]) {
      setError(t("error.create_required"));
      return;
    }

    setCreating(true);
    setError(undefined);

    try {
      const savedBundle = await saveSourceBundle(bundle);
      catalogue.importSourceBundle(savedBundle);
      setCreateOpen(false);
      history.pushState({}, "", Route.SettingsCampaign);
    } catch (e) {
      console.error(e);
      setError(t("error.create"));
    } finally {
      setCreating(false);
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
    } catch (e) {
      console.error(e);
      setError(t("error.remove"));
    }
  };

  const openExportDialog = (source: Source) => {
    setError(undefined);
    setExportSource(source);
    setIncludePrivate(true);
  };

  const closeExportDialog = () => {
    setExportSource(undefined);
  };

  const exportSelectedSource = async () => {
    if (!exportSource) return;

    setError(undefined);

    try {
      const bundle = catalogue.getSourceBundle(exportSource.id, {
        includePrivate,
      });
      if (!bundle) throw new Error(`Source not found: ${exportSource.id}`);

      const json = JSON.stringify(bundle, null, 2);
      downloadFile(json, `${exportSource.code}.json`, "json");
      closeExportDialog();
    } catch (e) {
      console.error(e);
      setError(t("error.export"));
    }
  };

  return (
    <Box bgColor="bg.subtle" flex={1} h="full">
      <VStack flex={1} gap={6} h="full" overflow="auto" p={10} w="full">
        <HStack align="flex-start" justify="space-between" w="full">
          <VStack align="flex-start" gap={1}>
            <Heading>{t("title")}</Heading>
            <Text color="fg.muted">{t("subtitle")}</Text>
          </VStack>

          <HStack>
            <Button
              onClick={() => {
                setError(undefined);
                setCreateOpen(true);
              }}
              size="sm"
            >
              {t("create")}
            </Button>

            <Button onClick={() => inputRef.current?.click()} size="sm">
              {t("import")}
            </Button>
          </HStack>
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
          <Tabs.Root defaultValue="my-sources" w="full">
            <Tabs.List>
              <Tabs.Trigger value="my-sources">{t("my_sources")}</Tabs.Trigger>
              <Tabs.Trigger value="official">{t("official")}</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="my-sources">
              <SourceGroups
                groups={localSourceGroups}
                lang={lang}
                onExport={openExportDialog}
                onRemove={removeSource}
                translateSourceVersion={translateSourceVersion}
              />
            </Tabs.Content>

            <Tabs.Content value="official">
              <SourceGroups
                groups={officialSourceGroups}
                lang={lang}
                onExport={openExportDialog}
                onRemove={removeSource}
                translateSourceVersion={translateSourceVersion}
              />
            </Tabs.Content>
          </Tabs.Root>
        : null}
      </VStack>

      <SourceCreateDialog
        creating={creating}
        onCreate={createSource}
        onOpenChange={setCreateOpen}
        open={createOpen}
      />

      <Dialog.Root
        lazyMount
        onOpenChange={({ open }) => {
          if (!open) closeExportDialog();
        }}
        open={!!exportSource}
        size="sm"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{t("export")}</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <VStack align="flex-start" gap={4}>
                  <Text color="fg.muted" fontSize="sm">
                    {exportSource ?
                      ti("export.description", exportSource.code)
                    : ""}
                  </Text>

                  <Checkbox
                    label={t("export.include_private")}
                    onValueChange={setIncludePrivate}
                    value={includePrivate}
                  />
                </VStack>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">{t("cancel")}</Button>
                </Dialog.ActionTrigger>

                <Button onClick={exportSelectedSource}>{t("export")}</Button>
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton position="absolute" right={2} top={2} />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}

//------------------------------------------------------------------------------
// Source Groups
//------------------------------------------------------------------------------

type SourceGroup = { sources: Source[]; type: SourceType };

type SourceGroupsProps = {
  groups: SourceGroup[];
  lang: string;
  onExport: (source: Source) => void;
  onRemove: (sourceId: string) => void;
  translateSourceVersion: (version: Source["version"]) => { label: string };
};

function SourceGroups({
  groups,
  lang,
  onExport,
  onRemove,
  translateSourceVersion,
}: SourceGroupsProps) {
  const { t } = useI18nLangContext(i18nContext);

  if (!groups.length)
    return (
      <Text color="fg.muted" fontSize="sm" pt={4}>
        {t("empty")}
      </Text>
    );

  return (
    <VStack gap={4} pt={4} w="full">
      {groups.map(({ sources, type }) => (
        <VStack align="flex-start" gap={2} key={type} w="full">
          <Text color="fg.muted" fontSize="xs" fontWeight="medium">
            {t(type)}
          </Text>

          <VStack gap={2} w="full">
            {sources.map((source) => (
              <SourceRow
                key={source.id}
                lang={lang}
                onExport={onExport}
                onRemove={onRemove}
                source={source}
                translateSourceVersion={translateSourceVersion}
              />
            ))}
          </VStack>
        </VStack>
      ))}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Source Row
//------------------------------------------------------------------------------

type SourceRowProps = {
  lang: string;
  onExport: (source: Source) => void;
  onRemove: (sourceId: string) => void;
  source: Source;
  translateSourceVersion: (version: Source["version"]) => { label: string };
};

function SourceRow({
  lang,
  onExport,
  onRemove,
  source,
  translateSourceVersion,
}: SourceRowProps) {
  const { t } = useI18nLangContext(i18nContext);
  const name = source.name[lang] || source.code;

  return (
    <HStack
      bgColor="bg"
      borderRadius="sm"
      borderWidth={1}
      gap={3}
      minH={14}
      px={3}
      py={2}
      w="full"
    >
      <VStack align="flex-start" flex={1} gap={0}>
        <HStack gap={2} minW={0} w="full">
          <Text fontWeight="semibold" truncate>
            {name}
          </Text>
          {source.registry?.access === "read" && (
            <Badge colorPalette="gray" size="xs" variant="subtle">
              {t("readonly")}
            </Badge>
          )}
        </HStack>
        <Text color="fg.muted" fontSize="sm" truncate>
          {source.code} · {translateSourceVersion(source.version).label}
        </Text>
      </VStack>

      <IconButton
        Icon={DownloadIcon}
        label={t("export")}
        onClick={() => onExport(source)}
        size="xs"
        variant="ghost"
      />

      <IconButton
        Icon={Trash2Icon}
        colorPalette="red"
        label={t("remove")}
        onClick={() => onRemove(source.id)}
        size="xs"
        variant="ghost"
      />
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Group Sources By Type
//------------------------------------------------------------------------------

function groupSourcesByType(sources: Source[], lang: string): SourceGroup[] {
  const sourceTypes: SourceType[] = ["core", "module", "campaign"];

  return sourceTypes.flatMap((type) => {
    const groupSources = sources
      .filter((source) => source.type === type)
      .sort(compareSources(lang));

    return groupSources.length ? [{ sources: groupSources, type }] : [];
  });
}

//------------------------------------------------------------------------------
// Compare Sources
//------------------------------------------------------------------------------

function compareSources(lang: string): (a: Source, b: Source) => number {
  return (a, b) => {
    const nameA = a.name[lang] || a.code;
    const nameB = b.name[lang] || b.code;
    return nameA.localeCompare(nameB) || a.code.localeCompare(b.code);
  };
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
  "create": {
    en: "Create",
    it: "Crea",
  },
  "empty": {
    en: "No sources found",
    it: "Nessuna fonte trovata",
  },
  "error.create": {
    en: "The source could not be created.",
    it: "La fonte non può essere creata.",
  },
  "error.create_required": {
    en: "Name and code are required.",
    it: "Nome e codice sono obbligatori.",
  },
  "error.export": {
    en: "The selected source could not be exported.",
    it: "La fonte selezionata non può essere esportata.",
  },
  "error.import": {
    en: "The selected file is not a valid source JSON.",
    it: "Il file selezionato non è una fonte JSON valida.",
  },
  "error.remove": {
    en: "The selected source could not be removed.",
    it: "La fonte selezionata non può essere rimossa.",
  },
  "export": {
    en: "Export",
    it: "Esporta",
  },
  "export.description": {
    en: "Export <1> as a JSON source bundle.",
    it: "Esporta <1> come fonte JSON.",
  },
  "export.include_private": {
    en: "Include private resources",
    it: "Includi risorse private",
  },
  "import": {
    en: "Import",
    it: "Importa",
  },
  "module": {
    en: "Module",
    it: "Modulo",
  },
  "my_sources": {
    en: "My Sources",
    it: "Le Mie Fonti",
  },
  "official": {
    en: "Official",
    it: "Ufficiali",
  },
  "readonly": {
    en: "Read-only",
    it: "Sola lettura",
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
