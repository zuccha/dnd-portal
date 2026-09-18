import { useCallback, useMemo } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { type I18nString, translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import type { SourceBundle } from "~/models/catalogue/source-bundle";
import {
  removeSourceBundleResources,
  upsertSourceBundleResource,
} from "~/models/catalogue/source-bundle";
import { updateSourceBundle } from "~/models/catalogue/source-bundle-indexed-db";
import { compareObjects } from "~/utils/object";
import { normalizeString } from "~/utils/string";
import { createUuid } from "~/utils/uuid";
import { type Resource, type ResourceOption, type TranslationFields } from "./resource";
import { createResourceFilterStore } from "./resource-filter-store";
import {
  type ResourceComparator,
  type ResourceMatcher,
  compareResources,
  matchesInclusion,
  matchesName,
} from "./resource-filtering";
import { mergeResourcePatch } from "./resource-patch";
import { createResourceSelectionStore } from "./resource-selection-store";
import { useResourcesSourcesFilter } from "./resources-sources-filter";
import type { ResourceKind } from "../types/resource-kind";
import type { LocalizedResource } from "./localized-resource";
import type { ResourceFilters } from "./resource-filters";
import type { ZodType } from "zod";

//------------------------------------------------------------------------------
// Resource Store
//------------------------------------------------------------------------------

export type ResourceStore<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  C = any,
> = ReturnType<typeof createResourceStore<R, L, F, C>>;

//------------------------------------------------------------------------------
// Resource Store Options
//------------------------------------------------------------------------------

type ResourceStoreOptions<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  C,
> = {
  defaultFilters: F;
  defaultResource: R;
  displayName: I18nString;
  filtersSchema: ZodType<F>;
  matchesResource?: ResourceMatcher<R, F>;
  compareResources?: ResourceComparator<R, F>;
  orderOptions: { label: I18nString; value: string }[];
  translationFields: TranslationFields<R>[];
  localizeResource: (resource: R, context: C) => L;
  useLocalizationContext: (resource: R) => C;
};

//------------------------------------------------------------------------------
// Create Resource Store
//------------------------------------------------------------------------------

export function createResourceStore<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  C = undefined,
>(kind: ResourceKind, options: ResourceStoreOptions<R, L, F, C>) {
  const {
    defaultFilters,
    defaultResource,
    displayName,
    filtersSchema,
    matchesResource = () => true,
    compareResources: compareStoreResources = compareResources,
    orderOptions,
    translationFields,
    localizeResource,
    useLocalizationContext,
  } = options;

  const storeId = `resources[${kind}]`;
  const catalogueResourceStore = catalogue.createResourceStore(kind);
  const resourceSelectionStore = createResourceSelectionStore(storeId);

  const getResource = catalogueResourceStore.getResource as (resourceId: string) => R | undefined;
  const useResource = catalogueResourceStore.useResource as (resourceId: string) => R | undefined;
  const useResources = catalogueResourceStore.useResources as (resourceIds: string[]) => R[];

  const {
    useActiveSourceReferenceResourceIds: useCatalogueActiveSourceReferenceResourceIds,
    useActiveSourceResourceIds: useCatalogueActiveSourceResourceIds,
  } = catalogueResourceStore;

  const filterStore = createResourceFilterStore(
    `${storeId}.filters`,
    defaultFilters,
    filtersSchema,
  );
  const { useEffectiveFilters, useFilters } = filterStore;

  //------------------------------------------------------------------------------
  // Persist Resource
  //------------------------------------------------------------------------------

  async function persistResource(
    resource: R,
    updateBundle: (bundle: SourceBundle) => SourceBundle,
    operation: string,
  ): Promise<string | undefined> {
    try {
      await updateSourceBundle(resource.source_id, updateBundle);
      await catalogue.refreshSourceState(resource.source_id);
      catalogueResourceStore.upsertResource(resource);
      return undefined;
    } catch (error) {
      console.error(`${storeId}.${operation}`, error);
      return "form.error.update_failure";
    }
  }

  //------------------------------------------------------------------------------
  // Create Temporary Resource
  //------------------------------------------------------------------------------

  function createTemporaryResource(resource: R): boolean {
    if (!catalogue.isSourceEditable(resource.source_id)) return false;
    if (getResource(resource.id)) return false;

    catalogueResourceStore.upsertResource({ ...resource, virtual: true });
    return true;
  }

  //------------------------------------------------------------------------------
  // Set Resource Temporary
  //------------------------------------------------------------------------------

  async function setResourceTemporary(
    resourceId: string,
    temporary: boolean,
  ): Promise<string | undefined> {
    const resource = getResource(resourceId);
    if (!resource) return "form.error.update_failure";
    if (!catalogue.isSourceEditable(resource.source_id)) return "form.error.update_failure";
    if (resource.virtual === temporary) return undefined;

    const updatedResource = { ...resource, virtual: temporary };

    return persistResource(
      updatedResource,
      (bundle) =>
        temporary
          ? removeSourceBundleResources(bundle, kind, [resource.id])
          : upsertSourceBundleResource(bundle, updatedResource),
      "set_resource_temporary",
    );
  }

  //----------------------------------------------------------------------------
  // Resources
  //----------------------------------------------------------------------------

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Create Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  async function createResource(
    sourceId: string,
    resourcePatch: Partial<R>,
  ): Promise<string | undefined> {
    const source = catalogue.getSource(sourceId);
    if (!source) return "form.error.update_failure";
    if (!catalogue.isSourceEditable(sourceId)) return "form.error.update_failure";

    const resource = {
      ...defaultResource,
      ...resourcePatch,
      id: resourcePatch.id ?? createUuid(),
      kind,
      source_code: source.code,
      source_id: source.id,
      source_version: source.version,
      virtual: false,
    } as R;

    return persistResource(
      resource,
      (bundle) => upsertSourceBundleResource(bundle, resource),
      "create_resource",
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Delete Resources
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  async function deleteResources(resourceIds: string[]): Promise<string | undefined> {
    const resources = resourceIds
      .map(getResource)
      .filter((resource): resource is R => resource !== undefined);
    if (resources.some((resource) => !catalogue.isSourceEditable(resource.source_id)))
      return "form.error.update_failure";

    const sourceIds = [
      ...new Set(
        resources.filter((resource) => !resource.virtual).map(({ source_id }) => source_id),
      ),
    ];

    try {
      await Promise.all(
        sourceIds.map((sourceId) => {
          const ids = resources
            .filter((resource) => resource.source_id === sourceId)
            .map(({ id }) => id);

          return updateSourceBundle(sourceId, (bundle) =>
            removeSourceBundleResources(bundle, kind, ids),
          );
        }),
      );
      await Promise.all(sourceIds.map((sourceId) => catalogue.refreshSourceState(sourceId)));

      for (const resource of resources) catalogueResourceStore.removeResource(resource.id);
      resourceSelectionStore.deselectResources(resources.map(({ id }) => id));

      return undefined;
    } catch (error) {
      console.error(`${storeId}.delete_resources`, error);
      return "form.error.update_failure";
    }
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Update Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  async function updateResource(
    resourceId: string,
    resourcePatch: Partial<R>,
  ): Promise<string | undefined> {
    const current = getResource(resourceId);
    if (!current) return "form.error.update_failure";
    if (!catalogue.isSourceEditable(current.source_id)) return "form.error.update_failure";

    const resource = mergeResourcePatch(
      current,
      {
        ...resourcePatch,
        id: current.id,
        kind: current.kind,
        source_code: current.source_code,
        source_id: current.source_id,
        source_version: current.source_version,
      },
      translationFields,
    );

    if (resource.virtual) {
      catalogueResourceStore.upsertResource(resource);
      return undefined;
    }

    return persistResource(
      resource,
      (bundle) => upsertSourceBundleResource(bundle, resource),
      "update_resource",
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceIds(sourceId: string): string[] {
    const [sources] = useResourcesSourcesFilter(sourceId);
    const resourceIds = useCatalogueActiveSourceResourceIds();
    return useMemo(
      () =>
        resourceIds.filter((resourceId) => {
          const resource = getResource(resourceId);
          return resource && matchesInclusion(resource.source_id, sources);
        }),
      [resourceIds, sources],
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Filtered Resource Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useFilteredResourceIds(sourceId: string): string[] {
    const filters = useEffectiveFilters();
    const [lang] = useI18nLang();
    const resourceIds = useResourceIds(sourceId);
    const normalizedName = normalizeString(filters.name);

    return useMemo(
      () =>
        resourceIds
          .filter((resourceId) => {
            const resource = getResource(resourceId);
            if (!resource) return false;
            return matchesName(resource, normalizedName) && matchesResource(resource, filters);
          })
          .sort((aId, bId) => {
            const a = getResource(aId);
            const b = getResource(bId);
            if (!a || !b) return 0;
            return compareStoreResources(a, b, filters, lang);
          }),
      [filters, lang, normalizedName, resourceIds],
    );
  }

  //----------------------------------------------------------------------------
  // Localization
  //----------------------------------------------------------------------------

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localize Resource Name
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizeResourceName(lang: string): (resourceId: string) => string {
    useCatalogueActiveSourceReferenceResourceIds();

    return useCallback(
      (resourceId: string) => {
        const resource = getResource(resourceId);
        return resource ? translate(resource.name, lang) : "";
      },
      [lang],
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localize Resource Name Short
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizeResourceNameShort(lang: string): (resourceId: string) => string {
    useCatalogueActiveSourceReferenceResourceIds();

    return useCallback(
      (resourceId: string) => {
        const resource = getResource(resourceId);
        return resource ? translate(resource.name_short, lang) : "";
      },
      [lang],
    );
  }

  //------------------------------------------------------------------------------
  // Use Localized Resource Name
  //------------------------------------------------------------------------------

  function useLocalizedResourceName(resourceId: string): string {
    const [lang] = useI18nLang();
    const resource = useResource(resourceId);
    return resource ? translate(resource.name, lang) : "";
  }

  //------------------------------------------------------------------------------
  // Use Localized Resource Name Short
  //------------------------------------------------------------------------------

  function useLocalizedResourceNameShort(resourceId: string): string {
    const [lang] = useI18nLang();
    const resource = useResource(resourceId);
    return resource ? translate(resource.name_short, lang) : "";
  }

  //------------------------------------------------------------------------------
  // Use Localized Resource
  //------------------------------------------------------------------------------

  function useLocalizedResource(resourceId: string): L | undefined {
    const resource = useResource(resourceId);
    const context = useLocalizationContext(resource ?? defaultResource);
    return useMemo(
      () => (resource ? localizeResource(resource, context) : undefined),
      [context, resource],
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Options
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceOptions(): ResourceOption[] {
    const [lang] = useI18nLang();
    const resourceIds = useCatalogueActiveSourceReferenceResourceIds();

    return resourceIds
      .map(getResource)
      .filter((resource): resource is R => resource !== undefined)
      .map((resource) => ({
        label: translate(resource.name, lang),
        name: resource.name,
        name_short: resource.name_short,
        value: resource.id,
      }))
      .sort(compareObjects("label"));
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    id: storeId,
    kind,

    defaultResource,
    displayName,
    orderOptions,
    translationFields,

    useFilters,

    createTemporaryResource,
    createResource,
    deleteResources,
    getResource,
    setResourceTemporary,
    updateResource,
    useResource,
    useResourceIds,
    useResources,

    useFilteredResourceIds,

    deselectResource: resourceSelectionStore.deselectResource,
    deselectResources: resourceSelectionStore.deselectResources,
    selectResource: resourceSelectionStore.selectResource,
    selectResources: resourceSelectionStore.selectResources,
    setResourceSelection: resourceSelectionStore.setResourceSelection,
    toggleResourceSelection: resourceSelectionStore.toggleResourceSelection,
    useResourceSelection: resourceSelectionStore.useResourceSelection,
    useSelectedResourceIds: resourceSelectionStore.useSelectedResourceIds,

    useLocalizeResourceName,
    useLocalizeResourceNameShort,
    localizeResource,
    useLocalizationContext,
    useLocalizedResource,
    useLocalizedResourceName,
    useLocalizedResourceNameShort,
    useResourceOptions,
  };
}
