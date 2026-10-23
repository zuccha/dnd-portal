import { useLayoutEffect, useMemo, useState } from "react";
import { z } from "zod";
import { createLocalStore } from "../../store/local-store";
import { createMemoryStore } from "../../store/memory-store";
import { createOptionalMemoryStoreSet } from "../../store/optional-set/optional-memory-store-set";
import { createMemoryStoreSet } from "../../store/set/memory-store-set";
import { areSameArray } from "../../utils/array";
import { objectKeys } from "../../utils/object";
import { nilUuid } from "../../utils/uuid";
import {
  emptyResourceRelations,
  type RelationGroup,
  type RelationGroupRows,
  type ResourceRelations,
} from "./resource-relations";
import { type Source, canEditSource } from "./source";
import {
  type SourceBundle,
  type SourceBundleExportOptions,
  canAccessPrivateResources,
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
import type { CreatureFamily } from "../resources/creature-families/creature-family";
import type { CreatureHabitat } from "../resources/creature-habitats/creature-habitat";
import type { CreatureTag } from "../resources/creature-tags/creature-tag";
import type { CreatureTreasure } from "../resources/creature-treasures/creature-treasure";
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

  //------------------------------------------------------------------------------
  // Create Resources By Source Id
  //------------------------------------------------------------------------------

  function createResourcesBySourceId(kind: Resource["kind"]) {
    return createOptionalMemoryStoreSet<string, Map<string, Resource>>(
      `${id}/resources-by-source-id/${kind}`,
    );
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
  // Relation Rows By Source And Group
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const relationRowsBySourceAndGroup = createOptionalMemoryStoreSet<
    string,
    RelationGroupRows[RelationGroup][]
  >(`${id}/relations-by-source-and-group`);

  function relationStoreKey(sourceId: string, group: RelationGroup): string {
    return `${sourceId}\u0000${group}`;
  }

  function getSourceRelations(sourceId: string): ResourceRelations {
    return Object.fromEntries(
      (Object.keys(emptyResourceRelations) as RelationGroup[]).map((group) => [
        group,
        relationRowsBySourceAndGroup.get(relationStoreKey(sourceId, group)) ?? [],
      ]),
    ) as ResourceRelations;
  }

  function setSourceRelations(sourceId: string, relations: ResourceRelations): void {
    for (const group of Object.keys(emptyResourceRelations) as RelationGroup[]) {
      const key = relationStoreKey(sourceId, group);
      const previous = relationRowsBySourceAndGroup.get(key) ?? [];
      const next = relations[group] as RelationGroupRows[RelationGroup][];
      if (!areSameRelationRows(previous, next)) relationRowsBySourceAndGroup.set(key, next);
    }
  }

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
    creature_family: createResourcesById<CreatureFamily>("creature_family"),
    creature_habitat: createResourcesById<CreatureHabitat>("creature_habitat"),
    creature_tag: createResourcesById<CreatureTag>("creature_tag"),
    creature_treasure: createResourcesById<CreatureTreasure>("creature_treasure"),
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
    creature_family: createResourcesIdsBySourceId("creature_family"),
    creature_habitat: createResourcesIdsBySourceId("creature_habitat"),
    creature_tag: createResourcesIdsBySourceId("creature_tag"),
    creature_treasure: createResourcesIdsBySourceId("creature_treasure"),
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

  //------------------------------------------------------------------------------
  // Resources By Source Id By Kind
  //------------------------------------------------------------------------------

  const resourcesBySourceIdByKind = {
    armor: createResourcesBySourceId("armor"),
    armor_modifier: createResourcesBySourceId("armor_modifier"),
    background: createResourcesBySourceId("background"),
    character_class: createResourcesBySourceId("character_class"),
    character_subclass: createResourcesBySourceId("character_subclass"),
    creature: createResourcesBySourceId("creature"),
    creature_family: createResourcesBySourceId("creature_family"),
    creature_habitat: createResourcesBySourceId("creature_habitat"),
    creature_tag: createResourcesBySourceId("creature_tag"),
    creature_treasure: createResourcesBySourceId("creature_treasure"),
    eldritch_invocation: createResourcesBySourceId("eldritch_invocation"),
    feat: createResourcesBySourceId("feat"),
    feature: createResourcesBySourceId("feature"),
    item: createResourcesBySourceId("item"),
    item_modifier: createResourcesBySourceId("item_modifier"),
    language: createResourcesBySourceId("language"),
    maneuver: createResourcesBySourceId("maneuver"),
    metamagic: createResourcesBySourceId("metamagic"),
    plane: createResourcesBySourceId("plane"),
    service: createResourcesBySourceId("service"),
    species: createResourcesBySourceId("species"),
    spell: createResourcesBySourceId("spell"),
    tool: createResourcesBySourceId("tool"),
    tool_modifier: createResourcesBySourceId("tool_modifier"),
    vehicle: createResourcesBySourceId("vehicle"),
    weapon: createResourcesBySourceId("weapon"),
    weapon_modifier: createResourcesBySourceId("weapon_modifier"),
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

  //------------------------------------------------------------------------------
  // Resolved Resource Ids By Kind
  //------------------------------------------------------------------------------

  const resolvedResourceIdsByKind = new Map<ResourceKind, string[]>(
    objectKeys(resourcesByIdByKind).map((kind) => [kind, emptyIds]),
  );

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

  //------------------------------------------------------------------------------
  // Get Source Resource Order
  //------------------------------------------------------------------------------

  function getSourceResourceOrder(sourceId: string): { source_id: string; tier: number }[] {
    type SourcePriority = {
      depth: number;
      order: number;
      source_id: string;
      tier: number;
    };

    const queue: SourcePriority[] = [{ depth: 0, order: 0, source_id: sourceId, tier: 2 }];
    const bestPriorityBySourceId = new Map<string, SourcePriority>();
    let nextOrder = 1;

    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index]!;
      const previous = bestPriorityBySourceId.get(current.source_id);
      if (
        previous &&
        (previous.tier > current.tier ||
          (previous.tier === current.tier && previous.depth <= current.depth))
      )
        continue;

      bestPriorityBySourceId.set(current.source_id, current);

      const source = sourceById.get(current.source_id);
      if (!source) continue;

      const isReference = current.tier === 0;
      const dependencies = [
        ...source.requires.map(({ source_id }) => ({ source_id, tier: 0 })),
        ...source.includes.map(({ source_id }) => ({
          source_id,
          tier: isReference ? 0 : 1,
        })),
      ];

      for (const dependency of dependencies)
        queue.push({
          depth: current.depth + 1,
          order: nextOrder++,
          source_id: dependency.source_id,
          tier: dependency.tier,
        });
    }

    return [...bestPriorityBySourceId.values()]
      .sort((a, b) => a.tier - b.tier || b.depth - a.depth || a.order - b.order)
      .map(({ source_id, tier }) => ({ source_id, tier }));
  }

  //------------------------------------------------------------------------------
  // Rebuild Active Source Resources
  //------------------------------------------------------------------------------

  function rebuildActiveSourceResources(sourceId: string | undefined): void {
    for (const kind of objectKeys(resourcesByIdByKind)) {
      const resourceStore = resourcesByIdByKind[kind] as unknown as OptionalStoreSet<
        string,
        Resource
      >;
      const resolvedResources = new Map<string, Resource>();

      if (sourceId)
        for (const { source_id: candidateSourceId } of getSourceResourceOrder(sourceId)) {
          const resources = resourcesBySourceIdByKind[kind].get(candidateSourceId);
          if (!resources) continue;
          for (const resource of resources.values()) resolvedResources.set(resource.id, resource);
        }

      const resolvedResourceIds = [...resolvedResources.keys()];
      const nextResourceIdSet = new Set(resolvedResourceIds);

      for (const resourceId of resolvedResourceIdsByKind.get(kind) ?? emptyIds)
        if (!nextResourceIdSet.has(resourceId)) resourceStore.clear(resourceId);

      for (const [resourceId, resource] of resolvedResources)
        if (resourceStore.get(resourceId) !== resource) resourceStore.set(resourceId, resource);

      resolvedResourceIdsByKind.set(kind, resolvedResourceIds);
    }
  }

  //------------------------------------------------------------------------------
  // Update Active Resource
  //------------------------------------------------------------------------------

  function updateActiveResource(
    kind: ResourceKind,
    resourceId: string,
    sourceOrder: { source_id: string; tier: number }[],
  ): void {
    const resourceStore = resourcesByIdByKind[kind] as unknown as OptionalStoreSet<
      string,
      Resource
    >;
    let resolvedResource: Resource | undefined;

    for (const { source_id } of sourceOrder) {
      const resource = resourcesBySourceIdByKind[kind].get(source_id)?.get(resourceId);
      if (resource) resolvedResource = resource;
    }

    const currentResource = resourceStore.get(resourceId);
    if (currentResource === resolvedResource) return;

    if (resolvedResource) resourceStore.set(resourceId, resolvedResource);
    else resourceStore.clear(resourceId);
  }

  //------------------------------------------------------------------------------
  // Update Active Resource Ids
  //------------------------------------------------------------------------------

  function updateActiveResourceIds(
    kind: ResourceKind,
    resourceId: string,
    sourceOrder: { source_id: string; tier: number }[],
  ): void {
    const resourceSourceIds = sourceOrder
      .filter(({ tier }) => tier > 0)
      .map(({ source_id }) => source_id);
    const referenceSourceIds = sourceOrder.map(({ source_id }) => source_id);
    const isResource = resourceSourceIds.some((sourceId) =>
      resourcesBySourceIdByKind[kind].get(sourceId)?.has(resourceId),
    );
    const isReference = referenceSourceIds.some((sourceId) =>
      resourcesBySourceIdByKind[kind].get(sourceId)?.has(resourceId),
    );
    const resourceIds = activeSourceResourceIdsByKind.get(kind, emptyIds);
    const referenceResourceIds = activeSourceReferenceResourceIdsByKind.get(kind, emptyIds);
    const nextResourceIds = updateResourceIdList(resourceIds, resourceId, isResource);
    const nextReferenceResourceIds = updateResourceIdList(
      referenceResourceIds,
      resourceId,
      isReference,
    );

    if (nextResourceIds !== resourceIds)
      activeSourceResourceIdsByKind.set(kind, emptyIds, nextResourceIds);
    if (nextReferenceResourceIds !== referenceResourceIds)
      activeSourceReferenceResourceIdsByKind.set(kind, emptyIds, nextReferenceResourceIds);
  }

  //------------------------------------------------------------------------------
  // Update Resource Id List
  //------------------------------------------------------------------------------

  function updateResourceIdList(resourceIds: string[], resourceId: string, shouldInclude: boolean) {
    const includesResource = resourceIds.includes(resourceId);
    if (includesResource === shouldInclude) return resourceIds;
    return shouldInclude
      ? [...resourceIds, resourceId]
      : resourceIds.filter((id) => id !== resourceId);
  }

  //----------------------------------------------------------------------------
  // Set Active Source Resource Ids
  //----------------------------------------------------------------------------

  function setActiveSourceResourceIds(sourceId: string | undefined): void {
    const sourceOrder = sourceId ? getSourceResourceOrder(sourceId) : [];
    const resourceSourceIds = sourceOrder
      .filter(({ tier }) => tier > 0)
      .map(({ source_id }) => source_id);
    const referenceSourceIds = sourceOrder.map(({ source_id }) => source_id);

    rebuildActiveSourceResources(sourceId);

    for (const kind of objectKeys(resourceIdsBySourceIdByKind)) {
      const resourceIds = getResourceIdsByKind(kind, resourceSourceIds);
      if (!areSameArray(activeSourceResourceIdsByKind.get(kind, emptyIds), resourceIds))
        activeSourceResourceIdsByKind.set(kind, emptyIds, resourceIds);

      const referenceResourceIds = getResourceIdsByKind(kind, referenceSourceIds);
      if (
        !areSameArray(
          activeSourceReferenceResourceIdsByKind.get(kind, emptyIds),
          referenceResourceIds,
        )
      )
        activeSourceReferenceResourceIdsByKind.set(kind, emptyIds, referenceResourceIds);
    }
  }

  //----------------------------------------------------------------------------
  // Get Active Source Reference Resources
  //----------------------------------------------------------------------------

  function getActiveSourceReferenceResources(): Resource[] {
    const source = getActiveSource();
    if (!source) return [];

    const sourceIds = getSourceResourceOrder(source.id).map(({ source_id }) => source_id);

    return objectKeys(resourcesByIdByKind).flatMap((kind) => {
      const resourceIds = getResourceIdsByKind(kind, sourceIds);
      const store = resourcesByIdByKind[kind] as unknown as OptionalStoreSet<string, Resource>;
      return resourceIds.flatMap((resourceId) => {
        const resource = store.get(resourceId);
        if (!resource) return [];

        const resourceSource = sourceById.get(resource.source_id);
        const canAccessPrivate =
          !resourceSource?.registry || canAccessPrivateResources(resourceSource);

        return resource.visibility !== "private" || canAccessPrivate ? [resource] : [];
      });
    });
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
  // Get Relations
  //------------------------------------------------------------------------------

  function getRelations<G extends RelationGroup>(
    sourceIds: string[],
    group: G,
  ): RelationGroupRows[G][] {
    const uniqueRows = new Map<string, RelationGroupRows[G]>();
    for (const sourceId of sourceIds) {
      const rows = relationRowsBySourceAndGroup.get(relationStoreKey(sourceId, group)) ?? [];
      for (const row of rows) {
        const minLevel = "minimum_level" in row ? row.minimum_level : "";
        const key = `${row.resource_1_kind}:${row.resource_1_id}:${row.resource_2_kind}:${row.resource_2_id}:${minLevel}`;
        if (!uniqueRows.has(key)) uniqueRows.set(key, row as RelationGroupRows[G]);
      }
    }
    return [...uniqueRows.values()];
  }

  //------------------------------------------------------------------------------
  // Are Same Relation Rows
  //------------------------------------------------------------------------------

  function areSameRelationRows(
    rows1: RelationGroupRows[RelationGroup][],
    rows2: RelationGroupRows[RelationGroup][],
  ): boolean {
    return (
      rows1.length === rows2.length &&
      rows1.every((row, index) => {
        const other = rows2[index];
        if (!other) return false;
        const keys = Object.keys(row) as (keyof typeof row)[];
        return (
          keys.length === Object.keys(other).length && keys.every((key) => row[key] === other[key])
        );
      })
    );
  }

  //------------------------------------------------------------------------------
  // Subscribe To Relations
  //------------------------------------------------------------------------------

  function subscribeToRelations(
    sourceIds: string[],
    groups: readonly RelationGroup[],
    callback: () => void,
  ): () => void {
    const unsubscribe = sourceIds.flatMap((sourceId) =>
      groups.map((group) =>
        relationRowsBySourceAndGroup.subscribe(relationStoreKey(sourceId, group), callback),
      ),
    );
    return () => unsubscribe.forEach((unsubscribeKey) => unsubscribeKey());
  }

  //------------------------------------------------------------------------------
  // Use Relations
  //------------------------------------------------------------------------------

  function useRelations<G extends RelationGroup>(
    sourceIds: string[],
    group: G,
  ): RelationGroupRows[G][] {
    const [rows, setRows] = useState(() => getRelations(sourceIds, group));

    useLayoutEffect(() => {
      function refresh(): void {
        setRows((previous) => {
          const next = getRelations(sourceIds, group);
          return areSameArray(previous, next) ? previous : next;
        });
      }

      refresh();
      return subscribeToRelations(sourceIds, [group], refresh);
    }, [group, sourceIds]);

    return rows;
  }

  //------------------------------------------------------------------------------
  // Get Active Source Relations
  //------------------------------------------------------------------------------

  function getActiveSourceRelations<G extends RelationGroup>(group: G): RelationGroupRows[G][] {
    const source = getActiveSource();
    if (!source) return [];
    return getRelations(
      getSourceResourceOrder(source.id).map(({ source_id }) => source_id),
      group,
    );
  }

  //------------------------------------------------------------------------------
  // Get Active Source Relation Groups
  //------------------------------------------------------------------------------

  function getActiveSourceRelationGroups(
    groups: readonly RelationGroup[] = Object.keys(emptyResourceRelations) as RelationGroup[],
  ): ResourceRelations {
    const groupsToRead = new Set(groups);
    return Object.fromEntries(
      (Object.keys(emptyResourceRelations) as RelationGroup[]).map((group) => [
        group,
        groupsToRead.has(group) ? getActiveSourceRelations(group) : [],
      ]),
    ) as ResourceRelations;
  }

  //------------------------------------------------------------------------------
  // Use Active Source Relations
  //------------------------------------------------------------------------------

  function useActiveSourceRelations<G extends RelationGroup>(group: G): RelationGroupRows[G][] {
    const source = useActiveSource();
    const sourceIds = useMemo(
      () =>
        source ? getSourceResourceOrder(source.id).map(({ source_id }) => source_id) : emptyIds,
      [source],
    );
    return useRelations(sourceIds, group);
  }

  //------------------------------------------------------------------------------
  // Use Active Source Relation Groups
  //------------------------------------------------------------------------------

  function useActiveSourceRelationGroups(groups: readonly RelationGroup[]): ResourceRelations {
    const source = useActiveSource();
    const sourceIds = useMemo(
      () =>
        source ? getSourceResourceOrder(source.id).map(({ source_id }) => source_id) : emptyIds,
      [source],
    );
    const [relations, setRelations] = useState(() => getActiveSourceRelationGroups(groups));

    useLayoutEffect(() => {
      function refresh(): void {
        setRelations((previous) => {
          const next = Object.fromEntries(
            (Object.keys(emptyResourceRelations) as RelationGroup[]).map((group) => [
              group,
              groups.includes(group) ? getRelations(sourceIds, group) : [],
            ]),
          ) as ResourceRelations;
          return Object.keys(next).every((group) =>
            areSameArray(
              previous[group as RelationGroup] as unknown[],
              next[group as RelationGroup] as unknown[],
            ),
          )
            ? previous
            : next;
        });
      }

      refresh();
      return subscribeToRelations(sourceIds, groups, refresh);
    }, [groups, sourceIds]);

    return relations;
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

  function useSource(sourceId: string): Source | undefined {
    return useSourceById(sourceId);
  }

  //----------------------------------------------------------------------------
  // Use Active Source
  //----------------------------------------------------------------------------

  function useActiveSource(): Source | undefined {
    const activeSourceId = useActiveSourceId();
    return useSource(activeSourceId ?? nilUuid);
  }

  //----------------------------------------------------------------------------
  // Use Active Source Reference Resources
  //----------------------------------------------------------------------------

  function useActiveSourceReferenceResources(): Resource[] {
    const source = useActiveSource();
    const [resources, setResources] = useState(getActiveSourceReferenceResources);

    useLayoutEffect(() => {
      function refresh(): void {
        setResources((previous) => {
          const next = getActiveSourceReferenceResources();
          return areSameArray(previous, next) ? previous : next;
        });
      }

      refresh();
      const unsubscribe = objectKeys(resourcesByIdByKind).map((kind) =>
        (resourcesByIdByKind[kind] as unknown as OptionalStoreSet<string, Resource>).subscribeAny(
          refresh,
        ),
      );

      return () => unsubscribe.forEach((unsubscribeKind) => unsubscribeKind());
    }, [source]);

    return resources;
  }

  //----------------------------------------------------------------------------
  // Use Source Editable
  //----------------------------------------------------------------------------

  function useSourceEditable(sourceId: string): boolean {
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
        const resourcesById = resourcesBySourceIdByKind[kind].get(sourceId);

        return [
          sourceBundleResourceKeyByKind[kind],
          resourceIds.flatMap((resourceId) => {
            const resource = resourcesById?.get(resourceId);
            return resource ? [resource] : [];
          }),
        ];
      }),
    ) as SourceBundle["resources"];

    return filterSourceBundleResources(
      {
        bundle_version: sourceBundleVersion,
        relations: getSourceRelations(sourceId),
        resources,
        source,
      },
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
    setActiveSourceResourceIds(activeSourceId.get());

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
    setActiveSourceResourceIds(activeSourceId.get());

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
      const resourceIdsBySourceId = resourceIdsBySourceIdByKind[kind] as StoreSet<string, string[]>;
      const sourceResourcesById = resourcesBySourceIdByKind[kind];

      sourceResourcesById.set(resource.source_id, (previous) => {
        const resources = new Map(previous ?? []);
        resources.set(resource.id, resource);
        return resources;
      });
      const sourceResourceIds = resourceIdsBySourceId.get(resource.source_id, emptyIds);
      if (!sourceResourceIds.includes(resource.id))
        resourceIdsBySourceId.set(resource.source_id, emptyIds, [
          ...sourceResourceIds,
          resource.id,
        ]);

      const activeId = activeSourceId.get();
      const sourceOrder = activeId ? getSourceResourceOrder(activeId) : [];
      if (sourceOrder.some(({ source_id }) => source_id === resource.source_id)) {
        updateActiveResource(kind, resource.id, sourceOrder);
        updateActiveResourceIds(kind, resource.id, sourceOrder);
      }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Remove Resource
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function removeResource(resourceId: string): void {
      const resource = getResource(resourceId);
      if (!resource) return;

      const resourceIdsBySourceId = resourceIdsBySourceIdByKind[kind] as StoreSet<string, string[]>;
      const sourceResourcesById = resourcesBySourceIdByKind[kind];

      sourceResourcesById.set(resource.source_id, (previous) => {
        const resources = new Map(previous ?? []);
        resources.delete(resourceId);
        return resources;
      });
      resourceIdsBySourceId.set(resource.source_id, emptyIds, (prev) =>
        prev.filter((id) => id !== resourceId),
      );

      const activeId = activeSourceId.get();
      const sourceOrder = activeId ? getSourceResourceOrder(activeId) : [];
      if (sourceOrder.some(({ source_id }) => source_id === resource.source_id)) {
        updateActiveResource(kind, resourceId, sourceOrder);
        updateActiveResourceIds(kind, resourceId, sourceOrder);
      }
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
      ["creature_family", importedBundle.resources.creature_families],
      ["creature_habitat", importedBundle.resources.creature_habitats],
      ["creature_tag", importedBundle.resources.creature_tags],
      ["creature_treasure", importedBundle.resources.creature_treasures],
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
    setSourceRelations(source.id, importedBundle.relations);

    for (const [kind, resources] of resourceImports) {
      const resourcesById = new Map(resources.map((resource) => [resource.id, resource]));
      resourcesBySourceIdByKind[kind].set(source.id, resourcesById);
      const resourceIds = resources.map(({ id }) => id);
      resourceIdsBySourceIdByKind[kind].set(source.id, [], resourceIds);
    }

    if (activate) setActiveSourceId(source.id);
    else {
      const activeId = activeSourceId.get();
      if (
        activeId &&
        getSourceResourceOrder(activeId).some(({ source_id }) => source_id === source.id)
      )
        setActiveSourceResourceIds(activeId);
    }

    return importedBundle;
  }

  //----------------------------------------------------------------------------
  // Remove Source Bundle
  //----------------------------------------------------------------------------

  function removeSourceBundle(sourceId: string): void {
    for (const kind of objectKeys(resourceIdsBySourceIdByKind)) {
      resourceIdsBySourceIdByKind[kind].set(sourceId, emptyIds, emptyIds);
      resourcesBySourceIdByKind[kind].clear(sourceId);
    }

    sourceById.clear(sourceId);
    for (const group of Object.keys(emptyResourceRelations) as RelationGroup[]) {
      relationRowsBySourceAndGroup.clear(relationStoreKey(sourceId, group));
    }
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
    getActiveSourceRelations,
    getActiveSourceRelationGroups,
    getRelations,
    getSource,
    getSourceBundle,
    getSourceRelations,
    importSourceBundle,
    isSourceEditable,
    markSourcePublished,
    refreshSourceState,
    removeSourceBundle,
    setActiveSourceId,
    setSourceRelations,
    setSourceState,
    updateSource,
    updateSourceRegistryMetadata,

    useActiveSource,
    useActiveSourceId: activeSourceId.useValue,
    useActiveSourceRelations,
    useActiveSourceRelationGroups,
    useActiveSourceReferenceResources,
    useRelations,
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
  useActiveSourceRelations,
  useActiveSourceRelationGroups,
  useActiveSourceReferenceResources,
  useRelations,
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
  useActiveSourceRelations,
  useActiveSourceRelationGroups,
  useActiveSourceReferenceResources,
  useRelations,
};
