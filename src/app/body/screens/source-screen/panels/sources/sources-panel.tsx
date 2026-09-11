import {
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
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import catalogue from "~/models/catalogue/catalogue";
import type { Source, SourceDependency } from "~/models/catalogue/source";
import {
  type SourceBundle,
  sourceBundleSchema,
} from "~/models/catalogue/source-bundle";
import {
  deleteSourceBundle,
  saveSourceBundle,
} from "~/models/catalogue/source-bundle-indexed-db";
import {
  analyzeRegistrySourceDependencies,
  fetchRegistrySourceBundles,
  fetchRegistrySources,
} from "~/models/registry/registry";
import { useTranslateSourceVersion } from "~/models/types/source-version";
import { Route } from "~/navigation/routes";
import Button from "~/ui/button";
import Checkbox from "~/ui/checkbox";
import { downloadFile } from "~/utils/download";
import SourceCreateDialog from "./source-create-dialog";
import SourceDependenciesDialog from "./source-dependencies-dialog";
import SourceGroups from "./source-list";
import {
  createSourceListEntry,
  getLocalSourceStatus,
  groupSourcesByType,
} from "./source-list-utils";
import i18nContext from "./sources-i18n";

//------------------------------------------------------------------------------
// Source Dependency Prompt
//------------------------------------------------------------------------------

type SourceDependencyPrompt = {
  bundle?: SourceBundle;
  navigateAfter: boolean;
  missingDependencies: SourceDependency[];
  registryDependencies: Source[];
  registrySourceIds: string[];
  source: Source;
};

//------------------------------------------------------------------------------
// Source Removal Prompt
//------------------------------------------------------------------------------

type SourceRemovalPrompt = {
  dependentSources: Source[];
  source: Source;
};

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
  const [registrySources, setRegistrySources] = useState<Source[]>([]);
  const [registryLoading, setRegistryLoading] = useState(true);
  const [registryError, setRegistryError] = useState(false);
  const [busySourceId, setBusySourceId] = useState<string>();
  const [dependencyPrompt, setDependencyPrompt] =
    useState<SourceDependencyPrompt>();
  const [removalPrompt, setRemovalPrompt] = useState<SourceRemovalPrompt>();
  const localSourcesById = useMemo(
    () => new Map(sources.map((source) => [source.id, source])),
    [sources],
  );

  useEffect(() => {
    let active = true;

    fetchRegistrySources()
      .then((nextSources) => {
        if (!active) return;
        setRegistrySources(nextSources);
        setRegistryError(false);
      })
      .catch((error) => {
        console.error(error);
        if (active) setRegistryError(true);
      })
      .finally(() => {
        if (active) setRegistryLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const localSourceGroups = groupSourcesByType(
    sources
      .filter((source) => !source.registry)
      .map((source) =>
        createSourceListEntry(
          source,
          getLocalSourceStatus(source, registrySources, registryLoading),
        ),
      ),
    lang,
  );
  const officialSourceGroups = groupSourcesByType(
    registrySources.map((registrySource) => {
      const source = localSourcesById.get(registrySource.id);
      return createSourceListEntry(
        source ?? registrySource,
        source?.registry ? "installed"
        : source ? "detached"
        : "available",
      );
    }),
    lang,
  );
  const allSourceGroups = groupSourcesByType(
    [
      ...sources.map((source) =>
        createSourceListEntry(
          source,
          source.registry ? "installed"
          : registrySources.some(({ id }) => id === source.id) ? "detached"
          : "local",
        ),
      ),
      ...registrySources
        .filter(({ id }) => !localSourcesById.has(id))
        .map((source) => createSourceListEntry(source, "available")),
    ],
    lang,
  );

  //----------------------------------------------------------------------------
  // Persist Source Bundles
  //----------------------------------------------------------------------------

  const persistSourceBundles = async (
    bundles: SourceBundle[],
    navigateAfter: boolean,
  ) => {
    const savedBundles = await Promise.all(
      bundles.map((bundle) => saveSourceBundle(bundle)),
    );
    for (const bundle of savedBundles) catalogue.importSourceBundle(bundle);

    if (navigateAfter) history.pushState({}, "", Route.SettingsCampaign);
  };

  //----------------------------------------------------------------------------
  // Start Source Import
  //----------------------------------------------------------------------------

  const startSourceImport = async (
    bundle: SourceBundle,
    navigateAfter = false,
  ): Promise<boolean> => {
    const analysis = analyzeRegistrySourceDependencies(
      bundle.source,
      registrySources,
      new Set(localSourcesById.keys()),
    );

    if (
      analysis.registryDependencies.length ||
      analysis.missingDependencies.length
    ) {
      setDependencyPrompt({
        bundle,
        missingDependencies: analysis.missingDependencies,
        navigateAfter,
        registryDependencies: analysis.registryDependencies,
        registrySourceIds: analysis.registrySourceIds,
        source: bundle.source,
      });
      return false;
    }

    await persistSourceBundles([bundle], navigateAfter);
    return true;
  };

  //----------------------------------------------------------------------------
  // Import Source
  //----------------------------------------------------------------------------

  const importSource = async (file: File | undefined) => {
    if (!file) return;
    setError(undefined);

    try {
      const text = await file.text();
      const bundle = sourceBundleSchema.parse(JSON.parse(text));
      await startSourceImport(bundle);
    } catch (e) {
      console.error(e);
      setError(t("error.import"));
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  //----------------------------------------------------------------------------
  // Create Source
  //----------------------------------------------------------------------------

  const createSource = async (bundle: SourceBundle) => {
    if (!bundle.source.code || !bundle.source.name[lang]) {
      setError(t("error.create_required"));
      return;
    }

    setCreating(true);
    setError(undefined);

    try {
      const imported = await startSourceImport(bundle, true);
      if (imported) setCreateOpen(false);
    } catch (e) {
      console.error(e);
      setError(t("error.create"));
    } finally {
      setCreating(false);
    }
  };

  //----------------------------------------------------------------------------
  // Remove Source
  //----------------------------------------------------------------------------

  const removeSource = async (sourceId: string) => {
    const source = sources.find((source) => source.id === sourceId);
    if (!source) return;

    const dependentSources = sources.filter(
      (candidate) =>
        candidate.id !== source.id &&
        [...candidate.includes, ...candidate.requires].some(
          ({ source_id }) => source_id === source.id,
        ),
    );

    setRemovalPrompt({ dependentSources, source });
  };

  //----------------------------------------------------------------------------
  // Complete Source Removal
  //----------------------------------------------------------------------------

  const completeSourceRemoval = async () => {
    const prompt = removalPrompt;
    if (!prompt) return;

    setRemovalPrompt(undefined);

    setError(undefined);

    try {
      await deleteSourceBundle(prompt.source.id);
      catalogue.removeSourceBundle(prompt.source.id);
    } catch (e) {
      console.error(e);
      setError(t("error.remove"));
    }
  };

  //----------------------------------------------------------------------------
  // Complete Source Dependency Prompt
  //----------------------------------------------------------------------------

  const completeSourceDependencyPrompt = async (
    downloadDependencies: boolean,
  ) => {
    const prompt = dependencyPrompt;
    if (!prompt) return;

    setDependencyPrompt(undefined);
    setBusySourceId(prompt.source.id);
    setError(undefined);

    try {
      const bundles = prompt.bundle ? [prompt.bundle] : [];
      const sourceIds =
        downloadDependencies ? prompt.registrySourceIds
        : prompt.bundle ? []
        : prompt.registrySourceIds.slice(0, 1);

      if (sourceIds.length) {
        bundles.push(...(await fetchRegistrySourceBundles(sourceIds)));
      }

      await persistSourceBundles(bundles, prompt.navigateAfter);
      if (prompt.navigateAfter) setCreateOpen(false);
    } catch (e) {
      console.error(e);
      setError(prompt.bundle ? t("error.import") : t("error.download"));
    } finally {
      setBusySourceId(undefined);
    }
  };

  //----------------------------------------------------------------------------
  // Download Registry Source
  //----------------------------------------------------------------------------

  const downloadRegistrySource = async (registrySource: Source) => {
    const officialSource =
      registrySources.find(({ id }) => id === registrySource.id) ??
      registrySource;
    const installedSource = localSourcesById.get(officialSource.id);
    if (
      installedSource &&
      !confirm(ti("make_official.confirm", officialSource.code))
    )
      return;

    setBusySourceId(officialSource.id);
    setError(undefined);

    try {
      const analysis = analyzeRegistrySourceDependencies(
        officialSource,
        registrySources,
        new Set(localSourcesById.keys()),
      );
      const registrySourceIds = [
        officialSource.id,
        ...analysis.registrySourceIds,
      ];

      if (
        analysis.registryDependencies.length ||
        analysis.missingDependencies.length
      ) {
        setDependencyPrompt({
          missingDependencies: analysis.missingDependencies,
          navigateAfter: false,
          registryDependencies: analysis.registryDependencies,
          registrySourceIds,
          source: officialSource,
        });
        return;
      }

      await persistSourceBundles(
        await fetchRegistrySourceBundles(registrySourceIds),
        false,
      );
    } catch (e) {
      console.error(e);
      setError(t("error.download"));
    } finally {
      setBusySourceId(undefined);
    }
  };

  //----------------------------------------------------------------------------
  // Make Source Local
  //----------------------------------------------------------------------------

  const makeSourceLocal = async (source: Source) => {
    if (!source.registry || !confirm(ti("make_local.confirm", source.code)))
      return;

    setBusySourceId(source.id);
    setError(undefined);

    try {
      await catalogue.detachSource(source.id);
    } catch (e) {
      console.error(e);
      setError(t("error.make_local"));
    } finally {
      setBusySourceId(undefined);
    }
  };

  //----------------------------------------------------------------------------
  // Open Export Dialog
  //----------------------------------------------------------------------------

  const openExportDialog = (source: Source) => {
    setError(undefined);
    setExportSource(source);
    setIncludePrivate(true);
  };

  //----------------------------------------------------------------------------
  // Close Export Dialog
  //----------------------------------------------------------------------------

  const closeExportDialog = () => {
    setExportSource(undefined);
  };

  //----------------------------------------------------------------------------
  // Export Selected Source
  //----------------------------------------------------------------------------

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

        {sources.length || registrySources.length || registryLoading ?
          <Tabs.Root defaultValue="all" w="full">
            <Tabs.List>
              <Tabs.Trigger value="all">{t("all")}</Tabs.Trigger>
              <Tabs.Trigger value="my-sources">{t("my_sources")}</Tabs.Trigger>
              <Tabs.Trigger value="official">{t("repository")}</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="all">
              {registryError && (
                <Text color="fg.muted" fontSize="sm" pt={4}>
                  {t("registry_unavailable")}
                </Text>
              )}
              <SourceGroups
                busySourceId={busySourceId}
                groups={allSourceGroups}
                lang={lang}
                onDownload={downloadRegistrySource}
                onExport={openExportDialog}
                onMakeLocal={makeSourceLocal}
                onRemove={removeSource}
                translateSourceVersion={translateSourceVersion}
              />
            </Tabs.Content>

            <Tabs.Content value="my-sources">
              <SourceGroups
                busySourceId={busySourceId}
                groups={localSourceGroups}
                lang={lang}
                onDownload={downloadRegistrySource}
                onExport={openExportDialog}
                onRemove={removeSource}
                translateSourceVersion={translateSourceVersion}
              />
            </Tabs.Content>

            <Tabs.Content value="official">
              <SourceGroups
                busySourceId={busySourceId}
                groups={officialSourceGroups}
                lang={lang}
                onDownload={downloadRegistrySource}
                onExport={openExportDialog}
                onMakeLocal={makeSourceLocal}
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

      {dependencyPrompt && (
        <SourceDependenciesDialog
          missingDependencies={dependencyPrompt.missingDependencies}
          onCancel={() => setDependencyPrompt(undefined)}
          onContinue={() => completeSourceDependencyPrompt(false)}
          onDownload={() => completeSourceDependencyPrompt(true)}
          onOpenChange={(open) => {
            if (!open) setDependencyPrompt(undefined);
          }}
          open
          registryDependencies={dependencyPrompt.registryDependencies}
          source={dependencyPrompt.source}
        />
      )}

      {removalPrompt && (
        <SourceDependenciesDialog
          dependentSources={removalPrompt.dependentSources}
          missingDependencies={[]}
          mode="remove"
          onCancel={() => setRemovalPrompt(undefined)}
          onContinue={() => setRemovalPrompt(undefined)}
          onDownload={() => undefined}
          onOpenChange={(open) => {
            if (!open) setRemovalPrompt(undefined);
          }}
          onRemove={completeSourceRemoval}
          open
          registryDependencies={[]}
          source={removalPrompt.source}
        />
      )}

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
