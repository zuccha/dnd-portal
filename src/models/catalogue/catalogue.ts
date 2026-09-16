import { useLayoutEffect, useState } from "react";
import { z } from "zod";
import { createLocalStore } from "../../store/local-store";
import { createMemoryStore } from "../../store/memory-store";
import { createOptionalMemoryStoreSet } from "../../store/optional-set/optional-memory-store-set";
import { createMemoryStoreSet } from "../../store/set/memory-store-set";
import { areSameArray } from "../../utils/array";
import { objectKeys } from "../../utils/object";
import { type Source, canEditSource } from "./source";
import {
  type SourceBundle,
  type SourceBundleExportOptions,
  filterSourceBundleResources,
  sourceBundleResourceKeyByKind,
  sourceBundleVersion,
} from "./source-bundle";
import {
  type LocalSourceState,
  loadSourceState,
  markSourceBundlePublished,
  updateSourceBundle,
  updateSourceBundleRegistryMetadata,
} from "./source-bundle-indexed-db";
import type { OptionalStoreSet } from "../../store/optional-set/optional-store-set";
import type { StoreSet } from "../../store/set/store-set";
import type { Background } from "../resources/backgrounds/background";
import type { CharacterClass } from "../resources/character-classes/character-class";
import type { CharacterSubclass } from "../resources/character-subclasses/character-subclass";
import type { CreatureTag } from "../resources/creature-tags/creature-tag";
import type { Creature } from "../resources/creatures/creature";
import type { EldritchInvocation } from "../resources/eldritch-invocations/eldritch-invocation";
import type { Armor } from "../resources/equipment/armors/armor";
import type { Item } from "../resources/equipment/items/item";
import type { Tool } from "../resources/equipment/tools/tool";
import type { Weapon } from "../resources/equipment/weapons/weapon";
import type { Feat } from "../resources/feats/feat";
import type { Feature } from "../resources/features/feature";
import type { Language } from "../resources/languages/language";
import type { Maneuver } from "../resources/maneuvers/maneuver";
import type { Metamagic } from "../resources/metamagics/metamagic";
import type { ArmorModifier } from "../resources/modifiers/equipment/armors/armor-modifier";
import type { ItemModifier } from "../resources/modifiers/equipment/items/item-modifier";
import type { ToolModifier } from "../resources/modifiers/equipment/tools/tool-modifier";
import type { WeaponModifier } from "../resources/modifiers/equipment/weapons/weapon-modifier";
import type { Plane } from "../resources/planes/plane";
import type { Resource } from "../resources/resource";
import type { Service } from "../resources/services/service";
import type { Species } from "../resources/species/species";
import type { Spell } from "../resources/spells/spell";
import type { Vehicle } from "../resources/vehicles/vehicle";
import type { ResourceKind } from "../types/resource-kind";

//------------------------------------------------------------------------------
// Create Catalogue
//------------------------------------------------------------------------------

export function createCatalogue(id: string) {
  const emptyIds: string[] = [];

  //----------------------------------------------------------------------------
  // Store Utils
  //----------------------------------------------------------------------------

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Create Resources By Id
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function createResourcesById<R extends Resource>(kind: Resource["kind"]) {
    return createOptionalMemoryStoreSet<string, R>(`${id}/resources-by-id/${kind}`);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Create Resources Ids By Source Id
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function createResourcesIdsBySourceId(kind: Resource["kind"]) {
    return createMemoryStoreSet<string, string[]>(`${id}/resources-ids-by-source-id/${kind}`);
  }

  //----------------------------------------------------------------------------
  // Stores
  //----------------------------------------------------------------------------

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Active Source Id
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const activeSourceId = createLocalStore<string | undefined>(
    "sources.selected_id",
    undefined,
    z.string().parse,
  );

  const useActiveSourceId = activeSourceId.useValue;

  // Source By Id
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const sourceById = createOptionalMemoryStoreSet<string, Source>(`${id}/source-by-id`);

  const useSourceById = sourceById.useValue;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Source Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const sourceIdList = createMemoryStore<string[]>(`${id}/source-ids`, []);

  const useSourceIdList = sourceIdList.useValue;

  //----------------------------------------------------------------------------
  // Source State By Id
  //----------------------------------------------------------------------------

  const sourceStateById = createOptionalMemoryStoreSet<string, LocalSourceState>(
    `${id}/source-state-by-id`,
  );

  const useSourceStateById = sourceStateById.useValue;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Resources By Id
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const resourcesByIdByKind = {
    armor: createResourcesById<Armor>("armor"),
    armor_modifier: createResourcesById<ArmorModifier>("armor_modifier"),
    background: createResourcesById<Background>("background"),
    character_class: createResourcesById<CharacterClass>("character_class"),
    character_subclass: createResourcesById<CharacterSubclass>("character_subclass"),
    creature: createResourcesById<Creature>("creature"),
    creature_tag: createResourcesById<CreatureTag>("creature_tag"),
    eldritch_invocation: createResourcesById<EldritchInvocation>("eldritch_invocation"),
    feat: createResourcesById<Feat>("feat"),
    feature: createResourcesById<Feature>("feature"),
    item: createResourcesById<Item>("item"),
    item_modifier: createResourcesById<ItemModifier>("item_modifier"),
    language: createResourcesById<Language>("language"),
    maneuver: createResourcesById<Maneuver>("maneuver"),
    metamagic: createResourcesById<Metamagic>("metamagic"),
    plane: createResourcesById<Plane>("plane"),
    service: createResourcesById<Service>("service"),
    species: createResourcesById<Species>("species"),
    spell: createResourcesById<Spell>("spell"),
    tool: createResourcesById<Tool>("tool"),
    tool_modifier: createResourcesById<ToolModifier>("tool_modifier"),
    vehicle: createResourcesById<Vehicle>("vehicle"),
    weapon: createResourcesById<Weapon>("weapon"),
    weapon_modifier: createResourcesById<WeaponModifier>("weapon_modifier"),
  };

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Resources Ids By Source Id
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const resourceIdsBySourceIdByKind = {
    armor: createResourcesIdsBySourceId("armor"),
    armor_modifier: createResourcesIdsBySourceId("armor_modifier"),
    background: createResourcesIdsBySourceId("background"),
    character_class: createResourcesIdsBySourceId("character_class"),
    character_subclass: createResourcesIdsBySourceId("character_subclass"),
    creature: createResourcesIdsBySourceId("creature"),
    creature_tag: createResourcesIdsBySourceId("creature_tag"),
    eldritch_invocation: createResourcesIdsBySourceId("eldritch_invocation"),
    feat: createResourcesIdsBySourceId("feat"),
    feature: createResourcesIdsBySourceId("feature"),
    item: createResourcesIdsBySourceId("item"),
    item_modifier: createResourcesIdsBySourceId("item_modifier"),
    language: createResourcesIdsBySourceId("language"),
    maneuver: createResourcesIdsBySourceId("maneuver"),
    metamagic: createResourcesIdsBySourceId("metamagic"),
    plane: createResourcesIdsBySourceId("plane"),
    service: createResourcesIdsBySourceId("service"),
    species: createResourcesIdsBySourceId("species"),
    spell: createResourcesIdsBySourceId("spell"),
    tool: createResourcesIdsBySourceId("tool"),
    tool_modifier: createResourcesIdsBySourceId("tool_modifier"),
    vehicle: createResourcesIdsBySourceId("vehicle"),
    weapon: createResourcesIdsBySourceId("weapon"),
    weapon_modifier: createResourcesIdsBySourceId("weapon_modifier"),
  };

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Active Source Resource Ids By Kind
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const activeSourceResourceIdsByKind = createMemoryStoreSet<ResourceKind, string[]>(
    `${id}/active-source-resource-ids-by-kind`,
  );

  const useActiveSourceResourceIdsByKind = activeSourceResourceIdsByKind.useValue;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Active Source Reference Resource Ids By Kind
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const activeSourceReferenceResourceIdsByKind = createMemoryStoreSet<ResourceKind, string[]>(
    `${id}/active-source-reference-resource-ids-by-kind`,
  );

  const useActiveSourceReferenceResourceIdsByKind = activeSourceReferenceResourceIdsByKind.useValue;

  //----------------------------------------------------------------------------
  // Active Source Resource Ids
  //----------------------------------------------------------------------------

  function getResourceIdsByKind(kind: ResourceKind, sourceIds: string[]): string[] {
    return [
      ...new Set(
        sourceIds.flatMap((sourceId) => resourceIdsBySourceIdByKind[kind].get(sourceId, emptyIds)),
      ),
    ];
  }

  //----------------------------------------------------------------------------
  // Set Active Source Resource Ids
  //----------------------------------------------------------------------------

  function setActiveSourceResourceIds(sourceId: string | undefined): void {
    const source = sourceId ? sourceById.get(sourceId) : undefined;

    const includeIds = source?.includes.map(({ source_id }) => source_id) ?? emptyIds;
    const requireIds = source?.requires.map(({ source_id }) => source_id) ?? emptyIds;

    const resourceSourceIds = sourceId ? [sourceId, ...includeIds] : emptyIds;
    const referenceSourceIds = [...resourceSourceIds, ...requireIds];

    for (const kind of objectKeys(resourceIdsBySourceIdByKind)) {
      activeSourceResourceIdsByKind.set(
        kind,
        emptyIds,
        getResourceIdsByKind(kind, resourceSourceIds),
      );

      activeSourceReferenceResourceIdsByKind.set(
        kind,
        emptyIds,
        getResourceIdsByKind(kind, referenceSourceIds),
      );
    }
  }

  //----------------------------------------------------------------------------
  // Set Active Source Id
  //----------------------------------------------------------------------------

  function setActiveSourceId(sourceId: string | undefined): void {
    activeSourceId.set(sourceId);
    setActiveSourceResourceIds(sourceId);
  }

  //----------------------------------------------------------------------------
  // Get Source
  //----------------------------------------------------------------------------

  function getSource(sourceId: string): Source | undefined {
    return sourceById.get(sourceId);
  }

  //----------------------------------------------------------------------------
  // Get Active Source
  //----------------------------------------------------------------------------

  function getActiveSource(): Source | undefined {
    const sourceId = activeSourceId.get();
    return sourceId ? getSource(sourceId) : undefined;
  }

  //------------------------------------------------------------------------------
  // Set Source State
  //------------------------------------------------------------------------------

  function setSourceState(state: LocalSourceState): void {
    sourceStateById.set(state.source_id, state);
  }

  //------------------------------------------------------------------------------
  // Refresh Source State
  //------------------------------------------------------------------------------

  async function refreshSourceState(sourceId: string): Promise<void> {
    const state = await loadSourceState(sourceId);
    if (state) setSourceState(state);
  }

  //------------------------------------------------------------------------------
  // Mark Source Published
  //------------------------------------------------------------------------------

  async function markSourcePublished(sourceId: string): Promise<void> {
    const state = await markSourceBundlePublished(sourceId);
    setSourceState(state);
  }

  //------------------------------------------------------------------------------
  // Use Source Has Unpublished Changes
  //------------------------------------------------------------------------------

  function useSourceHasUnpublishedChanges(sourceId: string): boolean {
    const state = useSourceStateById(sourceId);
    return (
      !!state?.published_bundle_hash && state.current_bundle_hash !== state.published_bundle_hash
    );
  }

  //----------------------------------------------------------------------------
  // Is Source Editable
  //----------------------------------------------------------------------------

  function isSourceEditable(sourceId: string): boolean {
    const source = getSource(sourceId);
    return canEditSource(source);
  }

  //----------------------------------------------------------------------------
  // Use Source
  //----------------------------------------------------------------------------

  function useSource(sourceId: string | undefined): Source | undefined {
    return useSourceById(sourceId ?? "");
  }

  //----------------------------------------------------------------------------
  // Use Active Source
  //----------------------------------------------------------------------------

  function useActiveSource(): Source | undefined {
    const activeSourceId = useActiveSourceId();
    return useSource(activeSourceId);
  }

  //----------------------------------------------------------------------------
  // Use Source Editable
  //----------------------------------------------------------------------------

  function useSourceEditable(sourceId: string | undefined): boolean {
    const source = useSource(sourceId);
    return canEditSource(source);
  }

  //----------------------------------------------------------------------------
  // Use Sources
  //----------------------------------------------------------------------------

  function useSources(): Source[] {
    const ids = useSourceIdList();
    return ids.flatMap((id) => {
      const source = sourceById.get(id);
      return source ? [source] : [];
    });
  }

  //----------------------------------------------------------------------------
  // Get Source Bundle
  //----------------------------------------------------------------------------

  function getSourceBundle(
    sourceId: string,
    options?: SourceBundleExportOptions,
  ): SourceBundle | undefined {
    const source = sourceById.get(sourceId);
    if (!source) return undefined;

    const resources = Object.fromEntries(
      objectKeys(sourceBundleResourceKeyByKind).map((kind) => {
        const resourceIds = resourceIdsBySourceIdByKind[kind].get(sourceId, emptyIds);

        return [
          sourceBundleResourceKeyByKind[kind],
          resourceIds.flatMap((resourceId) => {
            const resource = resourcesByIdByKind[kind].get(resourceId);
            return resource ? [resource] : [];
          }),
        ];
      }),
    ) as SourceBundle["resources"];

    return filterSourceBundleResources(
      { bundle_version: sourceBundleVersion, resources, source },
      options,
    );
  }

  //----------------------------------------------------------------------------
  // Update Source
  //----------------------------------------------------------------------------

  async function updateSource(
    sourceId: string,
    update: (source: Source) => Source,
  ): Promise<Source | undefined> {
    const current = sourceById.get(sourceId);
    if (!current) return undefined;
    if (!isSourceEditable(sourceId)) return undefined;

    const source = update(current);
    const bundle = await updateSourceBundle(sourceId, (bundle) => ({
      ...bundle,
      source,
    }));
    await refreshSourceState(sourceId);

    sourceById.set(bundle.source.id, bundle.source);
    if (activeSourceId.get() === bundle.source.id) setActiveSourceResourceIds(bundle.source.id);

    return bundle.source;
  }

  //----------------------------------------------------------------------------
  // Update Source Registry Metadata
  //----------------------------------------------------------------------------

  async function updateSourceRegistryMetadata(
    sourceId: string,
    registry: Source["registry"],
  ): Promise<Source | undefined> {
    const current = sourceById.get(sourceId);
    if (!current) return undefined;

    const bundle = await updateSourceBundleRegistryMetadata(sourceId, registry);
    sourceById.set(bundle.source.id, bundle.source);
    return bundle.source;
  }

  //----------------------------------------------------------------------------
  // Detach Source
  //----------------------------------------------------------------------------

  async function detachSource(sourceId: string): Promise<Source | undefined> {
    const current = sourceById.get(sourceId);
    if (!current?.registry) return current;

    const bundle = await updateSourceBundle(sourceId, (bundle) => {
      const { registry: _registry, ...source } = bundle.source;
      return { ...bundle, source };
    });
    await refreshSourceState(sourceId);

    sourceById.set(bundle.source.id, bundle.source);
    if (activeSourceId.get() === bundle.source.id) setActiveSourceResourceIds(bundle.source.id);

    return bundle.source;
  }

  //----------------------------------------------------------------------------
  // Create Resource Store
  //----------------------------------------------------------------------------

  type ResourceForKind<K extends ResourceKind> = Extract<Resource, { kind: K }>;

  function createResourceStore<const K extends ResourceKind>(kind: K) {
    type R = ResourceForKind<K>;
    const store = resourcesByIdByKind[kind] as unknown as OptionalStoreSet<string, R>;

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Get Resource
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function getResource(resourceId: string): R | undefined {
      return resourcesByIdByKind[kind].get(resourceId) as R | undefined;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Get Resources
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function getResources(resourceIds: string[]): R[] {
      return resourceIds.map(getResource).filter((resource) => resource !== undefined);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Upsert Resource
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function upsertResource(resource: R): void {
      const resourcesById = resourcesByIdByKind[kind] as unknown as OptionalStoreSet<string, R>;
      const resourceIdsBySourceId = resourceIdsBySourceIdByKind[kind] as StoreSet<string, string[]>;

      resourcesById.set(resource.id, resource);
      resourceIdsBySourceId.set(resource.source_id, emptyIds, (prev) =>
        prev.includes(resource.id) ? prev : [...prev, resource.id],
      );
      setActiveSourceResourceIds(activeSourceId.get());
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Remove Resource
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function removeResource(resourceId: string): void {
      const resource = getResource(resourceId);
      if (!resource) return;

      const resourcesById = resourcesByIdByKind[kind] as unknown as OptionalStoreSet<string, R>;
      const resourceIdsBySourceId = resourceIdsBySourceIdByKind[kind] as StoreSet<string, string[]>;

      resourcesById.clear(resourceId);
      resourceIdsBySourceId.set(resource.source_id, emptyIds, (prev) =>
        prev.filter((id) => id !== resourceId),
      );
      setActiveSourceResourceIds(activeSourceId.get());
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Use Resources
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function useResources(resourceIds: string[]): R[] {
      const [resources, setResources] = useState(() => getResources(resourceIds));

      useLayoutEffect(() => {
        function refreshResources(): void {
          setResources((prev) => {
            const next = getResources(resourceIds);
            return areSameArray(prev, next) ? prev : next;
          });
        }

        refreshResources();
        return resourcesByIdByKind[kind].subscribeAny(refreshResources);
      }, [resourceIds]);

      return resources;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Use Active Source Resource Ids
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function useActiveSourceResourceIds(): string[] {
      return useActiveSourceResourceIdsByKind(kind, emptyIds);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Use Active Source Reference Resource Ids
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function useActiveSourceReferenceResourceIds(): string[] {
      return useActiveSourceReferenceResourceIdsByKind(kind, emptyIds);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Return
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    return {
      getResource,
      removeResource,
      upsertResource,
      useActiveSourceReferenceResourceIds,
      useActiveSourceResourceIds,
      useResource: store.useValue,
      useResources,
    };
  }

  //----------------------------------------------------------------------------
  // Import Source Bundle
  //----------------------------------------------------------------------------

  function importSourceBundle(
    bundle: SourceBundle,
    { activate = true }: { activate?: boolean } = {},
  ): SourceBundle {
    const importedBundle = filterSourceBundleResources(bundle);
    const source = importedBundle.source;
    const resourceImports = [
      ["armor", importedBundle.resources.armors],
      ["armor_modifier", importedBundle.resources.armor_modifiers],
      ["background", importedBundle.resources.backgrounds],
      ["character_class", importedBundle.resources.character_classes],
      ["character_subclass", importedBundle.resources.character_subclasses],
      ["creature", importedBundle.resources.creatures],
      ["creature_tag", importedBundle.resources.creature_tags],
      ["eldritch_invocation", importedBundle.resources.eldritch_invocations],
      ["feat", importedBundle.resources.feats],
      ["feature", importedBundle.resources.features],
      ["item", importedBundle.resources.items],
      ["item_modifier", importedBundle.resources.item_modifiers],
      ["language", importedBundle.resources.languages],
      ["maneuver", importedBundle.resources.maneuvers],
      ["metamagic", importedBundle.resources.metamagics],
      ["plane", importedBundle.resources.planes],
      ["service", importedBundle.resources.services],
      ["species", importedBundle.resources.species],
      ["spell", importedBundle.resources.spells],
      ["tool", importedBundle.resources.tools],
      ["tool_modifier", importedBundle.resources.tool_modifiers],
      ["vehicle", importedBundle.resources.vehicles],
      ["weapon", importedBundle.resources.weapons],
      ["weapon_modifier", importedBundle.resources.weapon_modifiers],
    ] as const satisfies readonly [ResourceKind, readonly Resource[]][];

    sourceById.set(source.id, source);
    sourceIdList.set((prev) => (prev.includes(source.id) ? prev : [...prev, source.id]));

    for (const [kind, resources] of resourceImports) {
      type ResourceStoreSet = OptionalStoreSet<string, Resource>;
      const resourcesById = resourcesByIdByKind[kind] as ResourceStoreSet;
      const previousResourceIds = resourceIdsBySourceIdByKind[kind].get(source.id, emptyIds);

      for (const resourceId of previousResourceIds) resourcesById.clear(resourceId);
      for (const resource of resources) resourcesById.set(resource.id, resource);

      const resourceIds = resources.map(({ id }) => id);
      resourceIdsBySourceIdByKind[kind].set(source.id, [], resourceIds);
    }

    if (activate) setActiveSourceId(source.id);
    else if (activeSourceId.get() === source.id) setActiveSourceResourceIds(source.id);

    return importedBundle;
  }

  //----------------------------------------------------------------------------
  // Remove Source Bundle
  //----------------------------------------------------------------------------

  function removeSourceBundle(sourceId: string): void {
    for (const kind of objectKeys(resourceIdsBySourceIdByKind)) {
      const resourceIds = resourceIdsBySourceIdByKind[kind].get(sourceId, emptyIds);

      for (const resourceId of resourceIds) resourcesByIdByKind[kind].clear(resourceId);

      resourceIdsBySourceIdByKind[kind].set(sourceId, emptyIds, emptyIds);
    }

    sourceById.clear(sourceId);
    sourceStateById.clear(sourceId);
    sourceIdList.set((prev) => prev.filter((id) => id !== sourceId));

    if (activeSourceId.get() === sourceId) activeSourceId.set(undefined);
    setActiveSourceResourceIds(activeSourceId.get());
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    createResourceStore,
    detachSource,
    getActiveSource,
    getActiveSourceId: activeSourceId.get,
    getSource,
    getSourceBundle,
    importSourceBundle,
    isSourceEditable,
    markSourcePublished,
    refreshSourceState,
    removeSourceBundle,
    setActiveSourceId,
    setSourceState,
    updateSource,
    updateSourceRegistryMetadata,

    useActiveSource,
    useActiveSourceId: activeSourceId.useValue,
    useSource,
    useSourceEditable,
    useSourceHasUnpublishedChanges,
    useSources,
  };
}

//------------------------------------------------------------------------------
// Catalogue
//------------------------------------------------------------------------------

const {
  useActiveSource,
  useActiveSourceId,
  useSource,
  useSourceEditable,
  useSourceHasUnpublishedChanges,
  useSources,
  ...catalogue
} = createCatalogue("catalogue");

export default catalogue;

export {
  useActiveSource,
  useActiveSourceId,
  useSource,
  useSourceEditable,
  useSourceHasUnpublishedChanges,
  useSources,
};
