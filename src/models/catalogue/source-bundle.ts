import { z } from "zod";
import { backgroundSchema } from "../resources/backgrounds/background";
import { characterClassSchema } from "../resources/character-classes/character-class";
import { characterSubclassSchema } from "../resources/character-subclasses/character-subclass";
import { creatureTagSchema } from "../resources/creature-tags/creature-tag";
import { creatureSchema } from "../resources/creatures/creature";
import { eldritchInvocationSchema } from "../resources/eldritch-invocations/eldritch-invocation";
import { armorSchema } from "../resources/equipment/armors/armor";
import { equipmentSchema } from "../resources/equipment/equipment";
import { itemSchema } from "../resources/equipment/items/item";
import { toolSchema } from "../resources/equipment/tools/tool";
import { weaponSchema } from "../resources/equipment/weapons/weapon";
import { featSchema } from "../resources/feats/feat";
import { featureSchema } from "../resources/features/feature";
import { languageSchema } from "../resources/languages/language";
import { maneuverSchema } from "../resources/maneuvers/maneuver";
import { metamagicSchema } from "../resources/metamagics/metamagic";
import { armorModifierSchema } from "../resources/modifiers/equipment/armors/armor-modifier";
import { equipmentModifierSchema } from "../resources/modifiers/equipment/equipment-modifier";
import { itemModifierSchema } from "../resources/modifiers/equipment/items/item-modifier";
import { toolModifierSchema } from "../resources/modifiers/equipment/tools/tool-modifier";
import { weaponModifierSchema } from "../resources/modifiers/equipment/weapons/weapon-modifier";
import { modifierSchema } from "../resources/modifiers/modifier";
import { planeSchema } from "../resources/planes/plane";
import type { Resource } from "../resources/resource";
import { serviceSchema } from "../resources/services/service";
import { speciesSchema } from "../resources/species/species";
import { spellSchema } from "../resources/spells/spell";
import { vehicleSchema } from "../resources/vehicles/vehicle";
import { sourceMetadataSchema } from "../sources";
import type { ResourceKind } from "../types/resource-kind";

//------------------------------------------------------------------------------
// Source Bundle Resource Kind
//------------------------------------------------------------------------------

export type SourceBundleResourceKind = Exclude<ResourceKind, "resource">;

//------------------------------------------------------------------------------
// Source Bundle Resources
//------------------------------------------------------------------------------

export const sourceBundleResourcesSchema = z.object({
  armor_modifiers: armorModifierSchema.array().default([]),
  armors: armorSchema.array().default([]),
  backgrounds: backgroundSchema.array().default([]),
  character_classes: characterClassSchema.array().default([]),
  character_subclasses: characterSubclassSchema.array().default([]),
  creature_tags: creatureTagSchema.array().default([]),
  creatures: creatureSchema.array().default([]),
  eldritch_invocations: eldritchInvocationSchema.array().default([]),
  equipment_modifiers: equipmentModifierSchema.array().default([]),
  equipments: equipmentSchema.array().default([]),
  feats: featSchema.array().default([]),
  features: featureSchema.array().default([]),
  item_modifiers: itemModifierSchema.array().default([]),
  items: itemSchema.array().default([]),
  languages: languageSchema.array().default([]),
  maneuvers: maneuverSchema.array().default([]),
  metamagics: metamagicSchema.array().default([]),
  modifiers: modifierSchema.array().default([]),
  planes: planeSchema.array().default([]),
  services: serviceSchema.array().default([]),
  species: speciesSchema.array().default([]),
  spells: spellSchema.array().default([]),
  tool_modifiers: toolModifierSchema.array().default([]),
  tools: toolSchema.array().default([]),
  vehicles: vehicleSchema.array().default([]),
  weapon_modifiers: weaponModifierSchema.array().default([]),
  weapons: weaponSchema.array().default([]),
});

//------------------------------------------------------------------------------
// Source Bundle
//------------------------------------------------------------------------------

export const sourceBundleSchema = z.object({
  resources: sourceBundleResourcesSchema,
  source: sourceMetadataSchema,
});

export type SourceBundle = z.infer<typeof sourceBundleSchema>;

//------------------------------------------------------------------------------
// Source Bundle Resource Key By Kind
//------------------------------------------------------------------------------

export const sourceBundleResourceKeyByKind = {
  armor: "armors",
  armor_modifier: "armor_modifiers",
  background: "backgrounds",
  character_class: "character_classes",
  character_subclass: "character_subclasses",
  creature: "creatures",
  creature_tag: "creature_tags",
  eldritch_invocation: "eldritch_invocations",
  equipment: "equipments",
  equipment_modifier: "equipment_modifiers",
  feat: "feats",
  feature: "features",
  item: "items",
  item_modifier: "item_modifiers",
  language: "languages",
  maneuver: "maneuvers",
  metamagic: "metamagics",
  modifier: "modifiers",
  plane: "planes",
  service: "services",
  species: "species",
  spell: "spells",
  tool: "tools",
  tool_modifier: "tool_modifiers",
  vehicle: "vehicles",
  weapon: "weapons",
  weapon_modifier: "weapon_modifiers",
} as const satisfies Record<
  SourceBundleResourceKind,
  keyof SourceBundle["resources"]
>;

//------------------------------------------------------------------------------
// Upsert Source Bundle Resource
//------------------------------------------------------------------------------

export function upsertSourceBundleResource<R extends Resource>(
  bundle: SourceBundle,
  resource: R,
  { includeVirtual = false }: { includeVirtual?: boolean } = {},
): SourceBundle {
  if (resource.virtual && !includeVirtual) return bundle;
  if (resource.kind === "resource") return bundle;

  const key = sourceBundleResourceKeyByKind[resource.kind];
  const resources = bundle.resources[key] as Resource[];
  const nextResources =
    resources.some(({ id }) => id === resource.id) ?
      resources.map((current) =>
        current.id === resource.id ? resource : current,
      )
    : [...resources, resource];

  return {
    ...bundle,
    resources: {
      ...bundle.resources,
      [key]: nextResources,
    },
  };
}

//------------------------------------------------------------------------------
// Remove Source Bundle Resources
//------------------------------------------------------------------------------

export function removeSourceBundleResources(
  bundle: SourceBundle,
  kind: SourceBundleResourceKind,
  resourceIds: string[],
): SourceBundle {
  const key = sourceBundleResourceKeyByKind[kind];
  const resourceIdSet = new Set(resourceIds);
  const resources = bundle.resources[key] as Resource[];

  return {
    ...bundle,
    resources: {
      ...bundle.resources,
      [key]: resources.filter(({ id }) => !resourceIdSet.has(id)),
    },
  };
}
