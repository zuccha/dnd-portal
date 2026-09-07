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
import type { Service } from "../resources/services/service";
import type { Species } from "../resources/species/species";
import type { Spell } from "../resources/spells/spell";
import type { Vehicle } from "../resources/vehicles/vehicle";
import type { SourceMetadata } from "../sources";

//------------------------------------------------------------------------------
// Catalogue Resources By Id
//------------------------------------------------------------------------------

export type CatalogueResourcesById = {
  armors: Record<string, Armor>;
  armorModifiers: Record<string, ArmorModifier>;
  backgrounds: Record<string, Background>;
  characterClasses: Record<string, CharacterClass>;
  characterSubclasses: Record<string, CharacterSubclass>;
  creatures: Record<string, Creature>;
  creatureTags: Record<string, CreatureTag>;
  eldritchInvocations: Record<string, EldritchInvocation>;
  feats: Record<string, Feat>;
  features: Record<string, Feature>;
  items: Record<string, Item>;
  itemModifiers: Record<string, ItemModifier>;
  languages: Record<string, Language>;
  maneuvers: Record<string, Maneuver>;
  metamagics: Record<string, Metamagic>;
  planes: Record<string, Plane>;
  services: Record<string, Service>;
  species: Record<string, Species>;
  spells: Record<string, Spell>;
  tools: Record<string, Tool>;
  toolModifiers: Record<string, ToolModifier>;
  vehicles: Record<string, Vehicle>;
  weapons: Record<string, Weapon>;
  weaponModifiers: Record<string, WeaponModifier>;
};

//------------------------------------------------------------------------------
// Catalogue Resource Ids
//------------------------------------------------------------------------------

export type CatalogueResourceIds = {
  [R in keyof CatalogueResourcesById]: string[];
};

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
// Create Empty Catalogue Resource Buckets
//------------------------------------------------------------------------------

export function createEmptyCatalogueResourcesById(): CatalogueResourcesById {
  return {
    armorModifiers: {},
    armors: {},
    backgrounds: {},
    characterClasses: {},
    characterSubclasses: {},
    creatureTags: {},
    creatures: {},
    eldritchInvocations: {},
    feats: {},
    features: {},
    itemModifiers: {},
    items: {},
    languages: {},
    maneuvers: {},
    metamagics: {},
    planes: {},
    services: {},
    species: {},
    spells: {},
    toolModifiers: {},
    tools: {},
    vehicles: {},
    weaponModifiers: {},
    weapons: {},
  };
}

//------------------------------------------------------------------------------
// Create Empty Catalogue Resource Id Buckets
//------------------------------------------------------------------------------

export function createEmptyCatalogueResourceIds(): CatalogueResourceIds {
  return {
    armorModifiers: [],
    armors: [],
    backgrounds: [],
    characterClasses: [],
    characterSubclasses: [],
    creatureTags: [],
    creatures: [],
    eldritchInvocations: [],
    feats: [],
    features: [],
    itemModifiers: [],
    items: [],
    languages: [],
    maneuvers: [],
    metamagics: [],
    planes: [],
    services: [],
    species: [],
    spells: [],
    toolModifiers: [],
    tools: [],
    vehicles: [],
    weaponModifiers: [],
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
