import {
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
import { setAutoUpdateSources, useAutoUpdateSources } from "~/app/app-settings";
import useAuth from "~/auth/use-auth";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import catalogue, { useSources } from "~/models/catalogue/catalogue";
import type { Source, SourceDependency } from "~/models/catalogue/source";
import {
  type SourceBundle,
  canAccessPrivateResources,
  filterSourceBundleResources,
} from "~/models/catalogue/source-bundle";
import { deleteSourceBundle, saveSourceBundle } from "~/models/catalogue/source-bundle-indexed-db";
import { parseSourceBundle } from "~/models/catalogue/source-bundle-migrations/migrate-source-bundle";
import { publishSourceBundle } from "~/models/catalogue/source-bundle-sync";
import {
  analyzeRegistrySourceDependencies,
  canRegisterRegistrySource,
  fetchRegistrySourceBundles,
  fetchRegistrySources,
  registerRegistrySourceBundle,
} from "~/models/registry/registry";
import { useTranslateSourceVersion } from "~/models/types/source-version";
import { sourceSettingsRoute } from "~/navigation/routes";
import Button from "~/ui/button";
import Checkbox from "~/ui/checkbox";
import { downloadFile } from "~/utils/download";
import SourceCreateDialog from "./source-create-dialog";
import SourceDependenciesDialog from "./source-dependencies-dialog";
import SourceGroups from "./source-list";
import {
  createSourceListEntry,
  getInstalledSourceStatus,
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
  const auth = useAuth();
  const sources = useSources();
  const autoUpdateSources = useAutoUpdateSources();
  const translateSourceVersion = useTranslateSourceVersion(lang);
  const inputRef = useRef<HTMLInputElement>(null);
  const sourcesRef = useRef(sources);
  const [error, setError] = useState<string>();
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [exportSource, setExportSource] = useState<Source>();
  const [includePrivate, setIncludePrivate] = useState(true);
  const [registrySources, setRegistrySources] = useState<Source[]>([]);
  const [registryLoading, setRegistryLoading] = useState(true);
  const [registryError, setRegistryError] = useState(false);
  const [canRegisterSources, setCanRegisterSources] = useState(false);
  const [busySourceId, setBusySourceId] = useState<string>();
  const [dependencyPrompt, setDependencyPrompt] = useState<SourceDependencyPrompt>();
  const [removalPrompt, setRemovalPrompt] = useState<SourceRemovalPrompt>();
  const localSourcesById = useMemo(
    () => new Map(sources.map((source) => [source.id, source])),
    [sources],
  );

  //------------------------------------------------------------------------------
  // Update Sources Reference
  //------------------------------------------------------------------------------

  useEffect(() => {
    sourcesRef.current = sources;
  }, [sources]);

  useEffect(() => {
    if (auth.loading) return;

    let active = true;
    setRegistryLoading(true);

    Promise.all([fetchRegistrySources(), canRegisterRegistrySource()])
      .then(async ([nextSources, canRegister]) => {
        if (!active) return;
        setRegistrySources(nextSources);
        setCanRegisterSources(canRegister);
        setRegistryError(false);

        const registrySourceById = new Map(nextSources.map((source) => [source.id, source]));
        await Promise.all(
          sourcesRef.current.map((source) => {
            const registrySource = registrySourceById.get(source.id);
            if (source.registry && registrySource?.registry)
              return catalogue.updateSourceRegistryMetadata(source.id, registrySource.registry);
            if (source.registry && !registrySource)
              return catalogue.updateSourceRegistryMetadata(source.id, {
                ...source.registry,
                access: undefined,
              });
            return undefined;
          }),
        );
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
  }, [auth.loading, auth.user?.id]);

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
        source?.registry
          ? getInstalledSourceStatus(source, registrySource)
          : source
            ? "detached"
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
          source.registry
            ? getInstalledSourceStatus(
                source,
                registrySources.find(({ id }) => id === source.id) ?? source,
              )
            : registrySources.some(({ id }) => id === source.id)
              ? "detached"
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

  const persistSourceBundles = async (bundles: SourceBundle[], navigateAfter: boolean) => {
    const bundlesWithRegistryAccess = bundles.map((bundle) => {
      const registrySource = registrySources.find(({ id }) => id === bundle.source.id);
      const registry = registrySource?.registry;
      const bundleWithRegistry = registry
        ? { ...bundle, source: { ...bundle.source, registry } }
        : bundle;

      return filterSourceBundleResources(bundleWithRegistry, {
        includePrivate: !registry || canAccessPrivateResources(registrySource),
      });
    });
    const savedBundles = await Promise.all(
      bundlesWithRegistryAccess.map((bundle) => saveSourceBundle(bundle)),
    );
    for (const bundle of savedBundles) {
      catalogue.importSourceBundle(bundle);
      await catalogue.refreshSourceState(bundle.source.id);
    }
    setRegistrySources((previousSources) =>
      previousSources.map(
        (registrySource) =>
          savedBundles.find(({ source }) => source.id === registrySource.id)?.source ??
          registrySource,
      ),
    );

    if (navigateAfter && savedBundles[0])
      history.pushState({}, "", sourceSettingsRoute(savedBundles[0].source.id));
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

    if (analysis.registryDependencies.length || analysis.missingDependencies.length) {
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
      const bundle = parseSourceBundle(JSON.parse(text));
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

  //------------------------------------------------------------------------------
  // Publish Source
  //------------------------------------------------------------------------------

  const publishSource = async (source: Source) => {
    setBusySourceId(source.id);
    setError(undefined);

    try {
      const publishedSource = await publishSourceBundle(source.id);
      setRegistrySources((previousSources) =>
        previousSources.map((registrySource) =>
          registrySource.id === publishedSource?.id && publishedSource
            ? publishedSource
            : registrySource,
        ),
      );
    } catch (e) {
      console.error(e);
      setError(t("error.publish"));
    } finally {
      setBusySourceId(undefined);
    }
  };

  //------------------------------------------------------------------------------
  // Register Source
  //------------------------------------------------------------------------------

  const registerSource = async (source: Source) => {
    const bundle = catalogue.getSourceBundle(source.id, {
      includePrivate: true,
    });
    if (!bundle) return;

    setBusySourceId(source.id);
    setError(undefined);

    try {
      await registerRegistrySourceBundle(bundle);
      const registeredSource = (await fetchRegistrySources()).find(({ id }) => id === source.id);
      if (registeredSource?.registry)
        await catalogue.updateSource(source.id, (current) => ({
          ...current,
          registry: registeredSource.registry,
        }));
      await catalogue.markSourcePublished(source.id);
      setRegistrySources((previousSources) => [
        ...previousSources.filter(({ id }) => id !== registeredSource?.id),
        ...(registeredSource ? [registeredSource] : []),
      ]);
    } catch (e) {
      console.error(e);
      setError(t("error.register"));
    } finally {
      setBusySourceId(undefined);
    }
  };

  //----------------------------------------------------------------------------
  // Complete Source Dependency Prompt
  //----------------------------------------------------------------------------

  const completeSourceDependencyPrompt = async (downloadDependencies: boolean) => {
    const prompt = dependencyPrompt;
    if (!prompt) return;

    setDependencyPrompt(undefined);
    setBusySourceId(prompt.source.id);
    setError(undefined);

    try {
      const bundles = prompt.bundle ? [prompt.bundle] : [];
      const sourceIds = downloadDependencies
        ? prompt.registrySourceIds
        : prompt.bundle
          ? []
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
      registrySources.find(({ id }) => id === registrySource.id) ?? registrySource;
    const installedSource = localSourcesById.get(officialSource.id);
    if (installedSource && !confirm(ti("make_official.confirm", officialSource.code))) return;

    setBusySourceId(officialSource.id);
    setError(undefined);

    try {
      const analysis = analyzeRegistrySourceDependencies(
        officialSource,
        registrySources,
        new Set(localSourcesById.keys()),
      );
      const registrySourceIds = [officialSource.id, ...analysis.registrySourceIds];

      if (analysis.registryDependencies.length || analysis.missingDependencies.length) {
        setDependencyPrompt({
          missingDependencies: analysis.missingDependencies,
          navigateAfter: false,
          registryDependencies: analysis.registryDependencies,
          registrySourceIds,
          source: officialSource,
        });
        return;
      }

      await persistSourceBundles(await fetchRegistrySourceBundles(registrySourceIds), false);
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
    if (!source.registry || !confirm(ti("make_local.confirm", source.code))) return;

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

  //------------------------------------------------------------------------------
  // Open Source Settings
  //------------------------------------------------------------------------------

  const openSourceSettings = (source: Source) => {
    history.pushState({}, "", sourceSettingsRoute(source.id));
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
    <>
      <VStack
        align="stretch"
        flex={1}
        gap={{ base: 4, md: 6 }}
        h="full"
        overflow="auto"
        pb={0}
        pt={{ base: 4, md: 10 }}
        px={{ base: 4, md: 10 }}
        w="full"
      >
        <HStack
          align={{ base: "stretch", sm: "flex-start" }}
          flexDirection={{ base: "column", sm: "row" }}
          gap={4}
          justify="space-between"
          w="full"
        >
          <VStack align="flex-start" gap={1}>
            <Heading>{t("title")}</Heading>
            <Text color="fg.muted">{t("subtitle")}</Text>
          </VStack>

          <HStack flexWrap="wrap" justify={{ base: "flex-start", sm: "flex-end" }}>
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

        <Checkbox
          label={t("auto_update")}
          maxW="max-content"
          onValueChange={setAutoUpdateSources}
          value={autoUpdateSources}
        />

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

        {sources.length || registrySources.length || registryLoading ? (
          <Tabs.Root
            defaultValue="all"
            display="flex"
            flex={1}
            flexDirection="column"
            mx={{ base: -4, md: -10 }}
            w={{ base: "calc(100% + 2rem)", md: "calc(100% + 5rem)" }}
          >
            <Tabs.List borderBottomWidth={1} px={{ base: 4, md: 10 }}>
              <Tabs.Trigger value="all">{t("all")}</Tabs.Trigger>
              <Tabs.Trigger value="my-sources">{t("my_sources")}</Tabs.Trigger>
              <Tabs.Trigger value="official">{t("repository")}</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content
              bg="bg.muted"
              flex={1}
              pb={{ base: 4, md: 10 }}
              px={{ base: 4, md: 10 }}
              value="all"
            >
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
                onPublish={publishSource}
                onRegister={canRegisterSources ? registerSource : undefined}
                onRemove={removeSource}
                onSettings={openSourceSettings}
                translateSourceVersion={translateSourceVersion}
              />
            </Tabs.Content>

            <Tabs.Content
              bg="bg.muted"
              flex={1}
              pb={{ base: 4, md: 10 }}
              px={{ base: 4, md: 10 }}
              value="my-sources"
            >
              <SourceGroups
                busySourceId={busySourceId}
                groups={localSourceGroups}
                lang={lang}
                onDownload={downloadRegistrySource}
                onExport={openExportDialog}
                onPublish={publishSource}
                onRegister={canRegisterSources ? registerSource : undefined}
                onRemove={removeSource}
                onSettings={openSourceSettings}
                translateSourceVersion={translateSourceVersion}
              />
            </Tabs.Content>

            <Tabs.Content
              bg="bg.muted"
              flex={1}
              pb={{ base: 4, md: 10 }}
              px={{ base: 4, md: 10 }}
              value="official"
            >
              <SourceGroups
                busySourceId={busySourceId}
                groups={officialSourceGroups}
                lang={lang}
                onDownload={downloadRegistrySource}
                onExport={openExportDialog}
                onMakeLocal={makeSourceLocal}
                onPublish={publishSource}
                onRegister={canRegisterSources ? registerSource : undefined}
                onRemove={removeSource}
                onSettings={openSourceSettings}
                translateSourceVersion={translateSourceVersion}
              />
            </Tabs.Content>
          </Tabs.Root>
        ) : null}
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
                    {exportSource ? ti("export.description", exportSource.code) : ""}
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
    </>
  );
}
