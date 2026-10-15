import { useCallback, useContext, useMemo } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { type I18nString, translate } from "~/i18n/i18n-string";
import catalogue, {
  useActiveSourceRelationGroups,
  useActiveSourceRelations,
} from "~/models/catalogue/catalogue";
import {
  applyRelationEndpointUpdate,
  getRelationGroup,
  relationGroupByResourceKind,
  type RelatedResourceEntries,
  type RelatedResourceEntryByName,
  type RelatedResourceName,
  type RelationEndpointUpdate,
  type RelationGroup,
  type RelationGroupRows,
  type ResourceRelation,
  removeResourceRelations,
  updateResourceRelations,
} from "~/models/catalogue/resource-relations";
import { resourceRelationDraftContext } from "~/models/catalogue/resource-relations-draft-context";
import type { SourceBundle } from "~/models/catalogue/source-bundle";
import {
  removeSourceBundleResources,
  upsertSourceBundleResource,
  updateSourceBundleRelations,
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
  normalizeFilters?: (
    filters: F,
    resourceIds: readonly string[],
    getResource: (resourceId: string) => R | undefined,
    getRelatedIds: <N extends RelatedResourceName<R["kind"]>>(
      resourceId: string,
      name: N,
    ) => string[],
  ) => F;
  matchesResource?: ResourceMatcher<R, F>;
  compareResources?: ResourceComparator<R, F>;
  orderOptions: { label: I18nString; value: string }[];
  translationFields: TranslationFields<R>[];
  localizeResource: (resource: R, context: C) => L;
  useLocalizationContext: (resource: R, related: RelatedResourceEntries<R["kind"]>) => C;
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
    normalizeFilters = (filters) => filters,
    matchesResource = () => true,
    compareResources: compareStoreResources = compareResources,
    orderOptions,
    translationFields,
    localizeResource,
    useLocalizationContext: createLocalizationContext,
  } = options;
  const hasRelatedResourcesInLocalization =
    Object.keys(relationGroupByResourceKind[kind]).length > 0;
  const relatedRelationGroups = [
    ...new Set(Object.values(relationGroupByResourceKind[kind])),
  ] as RelationGroup[];

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
  const { useFilters } = filterStore;

  //------------------------------------------------------------------------------
  // Persist Resource
  //------------------------------------------------------------------------------

  async function persistResource(
    resource: R,
    updateBundle: (bundle: SourceBundle) => SourceBundle,
    operation: string,
    relationUpdates: RelationEndpointUpdate[] = [],
  ): Promise<string | undefined> {
    try {
      const bundle = await updateSourceBundle(resource.source_id, (current) =>
        updateSourceBundleRelations(updateBundle(current), resource, relationUpdates),
      );
      await catalogue.refreshSourceState(resource.source_id);
      catalogue.setSourceRelations(resource.source_id, bundle.relations);
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
    relationUpdates: RelationEndpointUpdate[] = [],
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
      relationUpdates,
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
        sourceIds.map(async (sourceId) => {
          const ids = resources
            .filter((resource) => resource.source_id === sourceId)
            .map(({ id }) => id);

          const bundle = await updateSourceBundle(sourceId, (bundle) =>
            removeSourceBundleResources(bundle, kind, ids),
          );
          catalogue.setSourceRelations(sourceId, bundle.relations);
        }),
      );
      await Promise.all(sourceIds.map((sourceId) => catalogue.refreshSourceState(sourceId)));

      for (const resource of resources) {
        if (resource.virtual) {
          const relations = catalogue.getSourceRelations(resource.source_id);
          catalogue.setSourceRelations(
            resource.source_id,
            removeResourceRelations(relations, resource),
          );
        }
        catalogueResourceStore.removeResource(resource.id);
      }
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
    relationUpdates: RelationEndpointUpdate[] = [],
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
      const relations = catalogue.getSourceRelations(resource.source_id);
      catalogue.setSourceRelations(
        resource.source_id,
        updateResourceRelations(relations, resource, relationUpdates),
      );
      catalogueResourceStore.upsertResource(resource);
      return undefined;
    }

    return persistResource(
      resource,
      (bundle) => upsertSourceBundleResource(bundle, resource),
      "update_resource",
      relationUpdates,
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
    const [filters] = useFilters();
    const [lang] = useI18nLang();
    const resourceIds = useResourceIds(sourceId);
    const relations = useActiveSourceRelationGroups(relatedRelationGroups);
    const getRelatedIds = useCallback(
      <N extends RelatedResourceName<R["kind"]>>(resourceId: string, name: N) =>
        getRelatedEntriesFromRelations(relations, resourceId, name).map(({ id }) => id),
      [relations],
    );
    const effectiveFilters = useMemo(
      () => normalizeFilters(filters, resourceIds, getResource, getRelatedIds),
      [filters, getRelatedIds, resourceIds],
    );
    const normalizedName = normalizeString(effectiveFilters.name);

    return useMemo(
      () =>
        resourceIds
          .filter((resourceId) => {
            const resource = getResource(resourceId);
            if (!resource) return false;
            return (
              matchesName(resource, normalizedName) &&
              matchesResource(resource, effectiveFilters, getRelatedIds)
            );
          })
          .sort((aId, bId) => {
            const a = getResource(aId);
            const b = getResource(bId);
            if (!a || !b) return 0;
            return compareStoreResources(a, b, effectiveFilters, lang);
          }),
      [effectiveFilters, getRelatedIds, lang, normalizedName, resourceIds],
    );
  }

  //----------------------------------------------------------------------------
  // Related Resources
  //----------------------------------------------------------------------------

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Get Related Entries
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function getRelatedEntries<N extends RelatedResourceName<R["kind"]>>(
    resourceId: string,
    name: N,
  ): RelatedResourceEntryByName<R["kind"], N>[] {
    return getRelatedEntriesFromRelations(
      catalogue.getActiveSourceRelationGroups(),
      resourceId,
      name,
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Get Related Entries From Relations
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function getRelatedEntriesFromRelations<N extends RelatedResourceName<R["kind"]>>(
    relations: ReturnType<typeof catalogue.getActiveSourceRelationGroups>,
    resourceId: string,
    name: N,
  ): RelatedResourceEntryByName<R["kind"], N>[] {
    const group = getRelationGroup(kind as R["kind"], name);
    return getRelatedEntriesFromRows(relations[group] as RelationGroupRows[typeof group][], {
      id: resourceId,
      kind: kind as R["kind"],
    }) as RelatedResourceEntryByName<R["kind"], N>[];
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Get Related Entries From Rows
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function getRelatedEntriesFromRows(
    rows: RelationGroupRows[keyof RelationGroupRows][],
    endpoint: { id: string; kind: ResourceKind },
  ): { id: string; kind: ResourceKind; min_level?: number }[] {
    const related = (rows as ResourceRelation<ResourceKind, ResourceKind>[])
      .flatMap((row) => {
        if (row.resource_1_kind === endpoint.kind && row.resource_1_id === endpoint.id) {
          return [
            {
              id: row.resource_2_id,
              kind: row.resource_2_kind,
              min_level:
                "min_level" in row && typeof row.min_level === "number" ? row.min_level : undefined,
              position: row.resource_1_position,
            },
          ];
        }
        if (row.resource_2_kind === endpoint.kind && row.resource_2_id === endpoint.id) {
          return [
            {
              id: row.resource_1_id,
              kind: row.resource_1_kind,
              min_level:
                "min_level" in row && typeof row.min_level === "number" ? row.min_level : undefined,
              position: row.resource_2_position,
            },
          ];
        }
        return [];
      })
      .sort((a, b) => a.position - b.position);

    return related.map(({ id, kind, min_level }) => ({ id, kind, min_level }));
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Get Related Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function getRelatedIds<N extends RelatedResourceName<R["kind"]>>(
    resourceId: string,
    name: N,
  ): string[] {
    return getRelatedEntries(resourceId, name).map(({ id }) => id);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Related Entries
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useRelatedEntries<N extends RelatedResourceName<R["kind"]>>(
    resourceId: string,
    name: N,
  ): RelatedResourceEntryByName<R["kind"], N>[] {
    const group = getRelationGroup(kind as R["kind"], name);
    const rows = useActiveSourceRelations(group);
    const draft = useContext(resourceRelationDraftContext);
    const effectiveRows = useMemo(() => {
      if (!draft || draft.endpoint.id !== resourceId || draft.endpoint.kind !== kind) {
        return rows;
      }
      const update = draft.updates.find((entry) => entry.group === group);
      return update
        ? (applyRelationEndpointUpdate(
            rows,
            { id: resourceId, kind },
            update,
          ) as RelationGroupRows[typeof group][])
        : rows;
    }, [draft, group, resourceId, rows]);

    return useMemo(
      () =>
        getRelatedEntriesFromRows(effectiveRows, {
          id: resourceId,
          kind,
        }) as RelatedResourceEntryByName<R["kind"], N>[],
      [effectiveRows, resourceId],
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Related Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useRelatedIds<N extends RelatedResourceName<R["kind"]>>(
    resourceId: string,
    name: N,
  ): string[] {
    const entries = useRelatedEntries(resourceId, name);
    return useMemo(() => entries.map(({ id }) => id), [entries]);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Related Resources For Localization
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useRelatedResourcesForLocalization(resource: R): RelatedResourceEntries<R["kind"]> {
    const relations = useActiveSourceRelationGroups(relatedRelationGroups);
    const draft = useContext(resourceRelationDraftContext);

    return useMemo(() => {
      let effectiveRelations = relations;

      if (draft?.endpoint.id === resource.id && draft.endpoint.kind === kind) {
        effectiveRelations = { ...relations };
        for (const update of draft.updates) {
          effectiveRelations[update.group] = applyRelationEndpointUpdate(
            effectiveRelations[update.group],
            draft.endpoint,
            update,
          ) as never;
        }
      }

      const names = Object.keys(relationGroupByResourceKind[kind]) as RelatedResourceName<
        R["kind"]
      >[];
      return Object.fromEntries(
        names.map((name) => [
          name,
          getRelatedEntriesFromRelations(effectiveRelations, resource.id, name),
        ]),
      ) as RelatedResourceEntries<R["kind"]>;
    }, [draft, relations, resource]);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localization Context
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizationContextWithoutRelatedResources(resource: R): C {
    return createLocalizationContext(resource, {} as RelatedResourceEntries<R["kind"]>);
  }

  function useLocalizationContextWithRelatedResources(resource: R): C {
    const relatedResources = useRelatedResourcesForLocalization(resource);
    return createLocalizationContext(resource, relatedResources);
  }

  const useStoreLocalizationContext = hasRelatedResourcesInLocalization
    ? useLocalizationContextWithRelatedResources
    : useLocalizationContextWithoutRelatedResources;

  //----------------------------------------------------------------------------
  // Localization
  //----------------------------------------------------------------------------

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localized Resource Name
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizedResourceName(resourceId: string): string {
    const [lang] = useI18nLang();
    const resource = useResource(resourceId);
    return resource ? translate(resource.name, lang) : "";
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localized Resource Names
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizedResourceNames(resourceIds: string[]): string[] {
    const [lang] = useI18nLang();
    const resources = useResources(resourceIds);

    return useMemo(
      () =>
        resourceIds.map((resourceId) => {
          const resource = resources.find(({ id }) => id === resourceId);
          return resource ? translate(resource.name, lang) : "";
        }),
      [lang, resourceIds, resources],
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localized Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizedResource(resourceId: string): L | undefined {
    const resource = useResource(resourceId);
    const context = useLocalizationContextWithoutRelatedResources(resource ?? defaultResource);
    return useMemo(
      () => (resource ? localizeResource(resource, context) : undefined),
      [context, resource],
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localized Resource With Related Resources
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizedResourceWithRelatedResources(resourceId: string): L | undefined {
    const resource = useResource(resourceId);
    const endpoint = resource ?? defaultResource;
    const relatedResources = useRelatedResourcesForLocalization(endpoint);
    const context = createLocalizationContext(endpoint, relatedResources);

    return useMemo(
      () => (resource ? localizeResource(resource, context) : undefined),
      [context, resource],
    );
  }

  const useLocalizedResourceWithContext = hasRelatedResourcesInLocalization
    ? useLocalizedResourceWithRelatedResources
    : useLocalizedResource;

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
    getRelatedEntries,
    getRelatedIds,
    setResourceTemporary,
    updateResource,
    useRelatedEntries,
    useRelatedIds,
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

    localizeResource,
    useLocalizationContext: useStoreLocalizationContext,
    useLocalizedResource: useLocalizedResourceWithContext,
    useLocalizedResourceName,
    useLocalizedResourceNames,
    useResourceOptions,
  };
}
