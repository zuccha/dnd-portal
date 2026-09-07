import { createMemoryStore } from "~/store/memory-store";
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
import type { Service } from "../resources/services/service";
import type { Species } from "../resources/species/species";
import type { Spell } from "../resources/spells/spell";
import type { Vehicle } from "../resources/vehicles/vehicle";
import type { SourceMetadata } from "../sources";
import { type SourceBundle, sourceBundleSchema } from "./source-bundle";

//------------------------------------------------------------------------------
// Catalogue Resources By Id
//------------------------------------------------------------------------------

export type CatalogueResourcesById = {
  armor_modifiers: Record<string, ArmorModifier>;
  armors: Record<string, Armor>;
  backgrounds: Record<string, Background>;
  character_classes: Record<string, CharacterClass>;
  character_subclasses: Record<string, CharacterSubclass>;
  creature_tags: Record<string, CreatureTag>;
  creatures: Record<string, Creature>;
  eldritch_invocations: Record<string, EldritchInvocation>;
  equipment_modifiers: Record<string, EquipmentModifier>;
  equipments: Record<string, Equipment>;
  feats: Record<string, Feat>;
  features: Record<string, Feature>;
  item_modifiers: Record<string, ItemModifier>;
  items: Record<string, Item>;
  languages: Record<string, Language>;
  maneuvers: Record<string, Maneuver>;
  metamagics: Record<string, Metamagic>;
  modifiers: Record<string, Modifier>;
  planes: Record<string, Plane>;
  services: Record<string, Service>;
  species: Record<string, Species>;
  spells: Record<string, Spell>;
  tool_modifiers: Record<string, ToolModifier>;
  tools: Record<string, Tool>;
  vehicles: Record<string, Vehicle>;
  weapon_modifiers: Record<string, WeaponModifier>;
  weapons: Record<string, Weapon>;
};

//------------------------------------------------------------------------------
// Catalogue Resource Ids
//------------------------------------------------------------------------------

export type CatalogueResourceIds = {
  [R in keyof CatalogueResourcesById]: string[];
};

//------------------------------------------------------------------------------
// Catalogue Resource Kinds
//------------------------------------------------------------------------------

export const catalogueResourceKinds = [
  "armor_modifiers",
  "armors",
  "backgrounds",
  "character_classes",
  "character_subclasses",
  "creature_tags",
  "creatures",
  "eldritch_invocations",
  "equipment_modifiers",
  "equipments",
  "feats",
  "features",
  "item_modifiers",
  "items",
  "languages",
  "maneuvers",
  "metamagics",
  "modifiers",
  "planes",
  "services",
  "species",
  "spells",
  "tool_modifiers",
  "tools",
  "vehicles",
  "weapon_modifiers",
  "weapons",
] as const satisfies readonly (keyof CatalogueResourcesById)[];

//------------------------------------------------------------------------------
// Catalogue
//------------------------------------------------------------------------------

export type Catalogue = {
  resources: {
    byId: CatalogueResourcesById;
    idsBySourceId: Record<string, CatalogueResourceIds>;
  };
  sources: {
    byId: Record<string, SourceMetadata>;
    active: {
      id: string | undefined;
      includedIds: string[];
      requiredIds: string[];
    };
  };
};

//------------------------------------------------------------------------------
// Create Empty Catalogue Resources By Id
//------------------------------------------------------------------------------

export function createEmptyCatalogueResourcesById(): CatalogueResourcesById {
  return {
    armor_modifiers: {},
    armors: {},
    backgrounds: {},
    character_classes: {},
    character_subclasses: {},
    creature_tags: {},
    creatures: {},
    eldritch_invocations: {},
    equipment_modifiers: {},
    equipments: {},
    feats: {},
    features: {},
    item_modifiers: {},
    items: {},
    languages: {},
    maneuvers: {},
    metamagics: {},
    modifiers: {},
    planes: {},
    services: {},
    species: {},
    spells: {},
    tool_modifiers: {},
    tools: {},
    vehicles: {},
    weapon_modifiers: {},
    weapons: {},
  };
}

//------------------------------------------------------------------------------
// Create Empty Catalogue Resource Id
//------------------------------------------------------------------------------

export function createEmptyCatalogueResourceIds(): CatalogueResourceIds {
  return {
    armor_modifiers: [],
    armors: [],
    backgrounds: [],
    character_classes: [],
    character_subclasses: [],
    creature_tags: [],
    creatures: [],
    eldritch_invocations: [],
    equipment_modifiers: [],
    equipments: [],
    feats: [],
    features: [],
    item_modifiers: [],
    items: [],
    languages: [],
    maneuvers: [],
    metamagics: [],
    modifiers: [],
    planes: [],
    services: [],
    species: [],
    spells: [],
    tool_modifiers: [],
    tools: [],
    vehicles: [],
    weapon_modifiers: [],
    weapons: [],
  };
}

//------------------------------------------------------------------------------
// Create Empty Catalogue
//------------------------------------------------------------------------------

export function createEmptyCatalogue(): Catalogue {
  return {
    resources: {
      byId: createEmptyCatalogueResourcesById(),
      idsBySourceId: {},
    },
    sources: {
      active: {
        id: undefined,
        includedIds: [],
        requiredIds: [],
      },
      byId: {},
    },
  };
}

//------------------------------------------------------------------------------
// Catalogue Store
//------------------------------------------------------------------------------

export const catalogueStore = createMemoryStore<Catalogue>(
  "catalogue",
  createEmptyCatalogue(),
);

export const useCatalogue = catalogueStore.useValue;

//------------------------------------------------------------------------------
// Import Source Bundle
//------------------------------------------------------------------------------

export function importSourceBundle(maybeBundle: unknown): SourceBundle {
  const bundle = sourceBundleSchema.parse(maybeBundle);
  const { include_ids, required_ids, ...source } = bundle.source;

  catalogueStore.set((prev) => {
    const byId = { ...prev.resources.byId };
    const sourceIds = createEmptyCatalogueResourceIds();
    const prevSourceIds = prev.resources.idsBySourceId[source.id];

    for (const kind of catalogueResourceKinds) {
      byId[kind] = { ...byId[kind] } as never;

      for (const resourceId of prevSourceIds?.[kind] ?? []) {
        delete byId[kind][resourceId];
      }

      for (const resource of bundle.resources[kind]) {
        byId[kind][resource.id] = resource as never;
        sourceIds[kind].push(resource.id);
      }
    }

    return {
      resources: {
        byId,
        idsBySourceId: {
          ...prev.resources.idsBySourceId,
          [source.id]: sourceIds,
        },
      },
      sources: {
        active: {
          id: source.id,
          includedIds: include_ids,
          requiredIds: required_ids,
        },
        byId: {
          ...prev.sources.byId,
          [source.id]: source,
        },
      },
    };
  });

  return bundle;
}

//------------------------------------------------------------------------------
// Use Catalogue Sources
//------------------------------------------------------------------------------

export function useCatalogueSources(): SourceMetadata[] {
  const catalogue = useCatalogue();
  return Object.values(catalogue.sources.byId);
}
