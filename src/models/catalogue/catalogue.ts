import { useLayoutEffect, useState } from "react";
import { z } from "zod";
import { createLocalStore } from "../../store/local-store";
import { createMemoryStore } from "../../store/memory-store";
import { createOptionalMemoryStoreSet } from "../../store/optional-set/optional-memory-store-set";
import type { OptionalStoreSet } from "../../store/optional-set/optional-store-set";
import { createMemoryStoreSet } from "../../store/set/memory-store-set";
import type { StoreSet } from "../../store/set/store-set";
import { areSameArray } from "../../utils/array";
import { objectKeys } from "../../utils/object";
import type { Background } from "../resources/backgrounds/background";
import type { CharacterClass } from "../resources/character-classes/character-class";
import type { CharacterSubclass } from "../resources/character-subclasses/character-subclass";
import type { CreatureTag } from "../resources/creature-tags/creature-tag";
import type { Creature } from "../resources/creatures/creature";
import type { EldritchInvocation } from "../resources/eldritch-invocations/eldritch-invocation";
import type { Armor } from "../resources/equipment/armors/armor";
import type { Equipment } from "../resources/equipment/equipment";
import type { Item } from "../resources/equipment/items/item";
import type { Tool } from "../resources/equipment/tools/tool";
import type { Weapon } from "../resources/equipment/weapons/weapon";
import type { Feat } from "../resources/feats/feat";
import type { Feature } from "../resources/features/feature";
import type { Language } from "../resources/languages/language";
import type { Maneuver } from "../resources/maneuvers/maneuver";
import type { Metamagic } from "../resources/metamagics/metamagic";
import type { ArmorModifier } from "../resources/modifiers/equipment/armors/armor-modifier";
import type { EquipmentModifier } from "../resources/modifiers/equipment/equipment-modifier";
import type { ItemModifier } from "../resources/modifiers/equipment/items/item-modifier";
import type { ToolModifier } from "../resources/modifiers/equipment/tools/tool-modifier";
import type { WeaponModifier } from "../resources/modifiers/equipment/weapons/weapon-modifier";
import type { Modifier } from "../resources/modifiers/modifier";
import type { Plane } from "../resources/planes/plane";
import type { Resource } from "../resources/resource";
import type { Service } from "../resources/services/service";
import type { Species } from "../resources/species/species";
import type { Spell } from "../resources/spells/spell";
import type { Vehicle } from "../resources/vehicles/vehicle";
import type { ResourceKind } from "../types/resource-kind";
import type { Source } from "./source";
import type { SourceBundle } from "./source-bundle";

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
    return createOptionalMemoryStoreSet<string, R>(
      `${id}/resources-by-id/${kind}`,
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Create Resources Ids By Source Id
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function createResourcesIdsBySourceId(kind: Resource["kind"]) {
    return createMemoryStoreSet<string, string[]>(
      `${id}/resources-ids-by-source-id/${kind}`,
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

  // Source By Id
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const sourceById = createOptionalMemoryStoreSet<string, Source>(
    `${id}/source-by-id`,
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Source Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const sourceIdList = createMemoryStore<string[]>(`${id}/source-ids`, []);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Resources By Id
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const resourcesByIdByKind = {
    armor: createResourcesById<Armor>("armor"),
    armor_modifier: createResourcesById<ArmorModifier>("armor_modifier"),
    background: createResourcesById<Background>("background"),
    character_class: createResourcesById<CharacterClass>("character_class"),
    character_subclass:
      createResourcesById<CharacterSubclass>("character_subclass"),
    creature: createResourcesById<Creature>("creature"),
    creature_tag: createResourcesById<CreatureTag>("creature_tag"),
    eldritch_invocation: createResourcesById<EldritchInvocation>(
      "eldritch_invocation",
    ),
    equipment: createResourcesById<Equipment>("equipment"),
    equipment_modifier:
      createResourcesById<EquipmentModifier>("equipment_modifier"),
    feat: createResourcesById<Feat>("feat"),
    feature: createResourcesById<Feature>("feature"),
    item: createResourcesById<Item>("item"),
    item_modifier: createResourcesById<ItemModifier>("item_modifier"),
    language: createResourcesById<Language>("language"),
    maneuver: createResourcesById<Maneuver>("maneuver"),
    metamagic: createResourcesById<Metamagic>("metamagic"),
    modifier: createResourcesById<Modifier>("modifier"),
    plane: createResourcesById<Plane>("plane"),
    resource: createResourcesById<Resource>("resource"),
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
    equipment: createResourcesIdsBySourceId("equipment"),
    equipment_modifier: createResourcesIdsBySourceId("equipment_modifier"),
    feat: createResourcesIdsBySourceId("feat"),
    feature: createResourcesIdsBySourceId("feature"),
    item: createResourcesIdsBySourceId("item"),
    item_modifier: createResourcesIdsBySourceId("item_modifier"),
    language: createResourcesIdsBySourceId("language"),
    maneuver: createResourcesIdsBySourceId("maneuver"),
    metamagic: createResourcesIdsBySourceId("metamagic"),
    modifier: createResourcesIdsBySourceId("modifier"),
    plane: createResourcesIdsBySourceId("plane"),
    resource: createResourcesIdsBySourceId("resource"),
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

  const activeSourceResourceIdsByKind = createMemoryStoreSet<
    ResourceKind,
    string[]
  >(`${id}/active-source-resource-ids-by-kind`);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Active Source Reference Resource Ids By Kind
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const activeSourceReferenceResourceIdsByKind = createMemoryStoreSet<
    ResourceKind,
    string[]
  >(`${id}/active-source-reference-resource-ids-by-kind`);

  //----------------------------------------------------------------------------
  // Active Source Resource Ids
  //----------------------------------------------------------------------------

  function getResourceIdsByKind(
    kind: ResourceKind,
    sourceIds: string[],
  ): string[] {
    return [
      ...new Set(
        sourceIds.flatMap((sourceId) =>
          resourceIdsBySourceIdByKind[kind].get(sourceId, emptyIds),
        ),
      ),
    ];
  }

  //----------------------------------------------------------------------------
  // Set Active Source Resource Ids
  //----------------------------------------------------------------------------

  function setActiveSourceResourceIds(sourceId: string | undefined): void {
    const source = sourceId ? sourceById.get(sourceId) : undefined;

    const includedIds = source?.include_ids ?? emptyIds;
    const requiredIds = source?.required_ids ?? emptyIds;

    const resourceSourceIds = sourceId ? [sourceId, ...includedIds] : emptyIds;
    const referenceSourceIds = [...resourceSourceIds, ...requiredIds];

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

  //----------------------------------------------------------------------------
  // Use Source
  //----------------------------------------------------------------------------

  function useSource(sourceId: string | undefined): Source | undefined {
    return sourceById.useValue(sourceId ?? "");
  }

  //----------------------------------------------------------------------------
  // Use Active Source
  //----------------------------------------------------------------------------

  function useActiveSource(): Source | undefined {
    return useSource(activeSourceId.useValue());
  }

  //----------------------------------------------------------------------------
  // Use Sources
  //----------------------------------------------------------------------------

  function useSources(): Source[] {
    const ids = sourceIdList.useValue();
    return ids.flatMap((id) => {
      const source = sourceById.get(id);
      return source ? [source] : [];
    });
  }

  //----------------------------------------------------------------------------
  // Create Resource Store
  //----------------------------------------------------------------------------

  type ResourceForKind<K extends ResourceKind> = Extract<Resource, { kind: K }>;

  function createResourceStore<const K extends ResourceKind>(kind: K) {
    type R = ResourceForKind<K>;

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
      return resourceIds
        .map(getResource)
        .filter((resource) => resource !== undefined);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Upsert Resource
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function upsertResource(resource: R): void {
      const resourcesById = resourcesByIdByKind[
        kind
      ] as unknown as OptionalStoreSet<string, R>;
      const resourceIdsBySourceId = resourceIdsBySourceIdByKind[
        kind
      ] as StoreSet<string, string[]>;

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

      const resourcesById = resourcesByIdByKind[
        kind
      ] as unknown as OptionalStoreSet<string, R>;
      const resourceIdsBySourceId = resourceIdsBySourceIdByKind[
        kind
      ] as StoreSet<string, string[]>;

      resourcesById.clear(resourceId);
      resourceIdsBySourceId.set(resource.source_id, emptyIds, (prev) =>
        prev.filter((id) => id !== resourceId),
      );
      setActiveSourceResourceIds(activeSourceId.get());
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Use Resource
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function useResource(resourceId: string): R | undefined {
      const store = resourcesByIdByKind[kind] as unknown as OptionalStoreSet<
        string,
        R
      >;
      return store.useValue(resourceId);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Use Resources
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function useResources(resourceIds: string[]): R[] {
      const [resources, setResources] = useState(() =>
        getResources(resourceIds),
      );

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
      return activeSourceResourceIdsByKind.useValue(kind, emptyIds);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Use Active Source Reference Resource Ids
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function useActiveSourceReferenceResourceIds(): string[] {
      return activeSourceReferenceResourceIdsByKind.useValue(kind, emptyIds);
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
      useResource,
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
    const source = bundle.source;
    const resourceImports = [
      ["armor", bundle.resources.armors],
      ["armor_modifier", bundle.resources.armor_modifiers],
      ["background", bundle.resources.backgrounds],
      ["character_class", bundle.resources.character_classes],
      ["character_subclass", bundle.resources.character_subclasses],
      ["creature", bundle.resources.creatures],
      ["creature_tag", bundle.resources.creature_tags],
      ["eldritch_invocation", bundle.resources.eldritch_invocations],
      ["equipment", bundle.resources.equipments],
      ["equipment_modifier", bundle.resources.equipment_modifiers],
      ["feat", bundle.resources.feats],
      ["feature", bundle.resources.features],
      ["item", bundle.resources.items],
      ["item_modifier", bundle.resources.item_modifiers],
      ["language", bundle.resources.languages],
      ["maneuver", bundle.resources.maneuvers],
      ["metamagic", bundle.resources.metamagics],
      ["modifier", bundle.resources.modifiers],
      ["plane", bundle.resources.planes],
      ["service", bundle.resources.services],
      ["species", bundle.resources.species],
      ["spell", bundle.resources.spells],
      ["tool", bundle.resources.tools],
      ["tool_modifier", bundle.resources.tool_modifiers],
      ["vehicle", bundle.resources.vehicles],
      ["weapon", bundle.resources.weapons],
      ["weapon_modifier", bundle.resources.weapon_modifiers],
    ] as const satisfies readonly [ResourceKind, readonly Resource[]][];

    sourceById.set(source.id, source);
    sourceIdList.set((prev) =>
      prev.includes(source.id) ? prev : [...prev, source.id],
    );

    for (const [kind, resources] of resourceImports) {
      type ResourceStoreSet = OptionalStoreSet<string, Resource>;
      const resourcesById = resourcesByIdByKind[kind] as ResourceStoreSet;

      for (const resource of resources)
        resourcesById.set(resource.id, resource);

      const resourceIds = resources.map(({ id }) => id);
      resourceIdsBySourceIdByKind[kind].set(source.id, [], resourceIds);
    }

    if (activate) setActiveSourceId(source.id);
    else if (activeSourceId.get() === source.id)
      setActiveSourceResourceIds(source.id);

    return bundle;
  }

  //----------------------------------------------------------------------------
  // Remove Source Bundle
  //----------------------------------------------------------------------------

  function removeSourceBundle(sourceId: string): void {
    for (const kind of objectKeys(resourceIdsBySourceIdByKind)) {
      const resourceIds = resourceIdsBySourceIdByKind[kind].get(
        sourceId,
        emptyIds,
      );

      for (const resourceId of resourceIds)
        resourcesByIdByKind[kind].clear(resourceId);

      resourceIdsBySourceIdByKind[kind].set(sourceId, emptyIds, emptyIds);
    }

    sourceById.clear(sourceId);
    sourceIdList.set((prev) => prev.filter((id) => id !== sourceId));

    if (activeSourceId.get() === sourceId) activeSourceId.set(undefined);
    setActiveSourceResourceIds(activeSourceId.get());
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    createResourceStore,
    getActiveSource,
    getActiveSourceId: activeSourceId.get,
    getSource,
    importSourceBundle,
    removeSourceBundle,
    setActiveSourceId,
    useActiveSource,
    useActiveSourceId: activeSourceId.useValue,
    useSource,
    useSources,
  };
}

//------------------------------------------------------------------------------
// Catalogue
//------------------------------------------------------------------------------

const catalogue = createCatalogue("catalogue");

export default catalogue;
