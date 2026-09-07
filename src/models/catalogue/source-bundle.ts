import { z } from "zod";
import { backgroundRawSchema } from "../resources/backgrounds/background";
import { characterClassRawSchema } from "../resources/character-classes/character-class";
import { characterSubclassSchema } from "../resources/character-subclasses/character-subclass";
import { creatureTagSchema } from "../resources/creature-tags/creature-tag";
import { creatureRawSchema } from "../resources/creatures/creature";
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
import { serviceSchema } from "../resources/services/service";
import { speciesSchema } from "../resources/species/species";
import { spellSchema } from "../resources/spells/spell";
import { vehicleSchema } from "../resources/vehicles/vehicle";
import { sourceMetadataSchema } from "../sources";

//------------------------------------------------------------------------------
// Source Bundle Resources
//------------------------------------------------------------------------------

export const sourceBundleResourcesSchema = z.object({
  armor_modifiers: armorModifierSchema.array().default([]),
  armors: armorSchema.array().default([]),
  backgrounds: backgroundRawSchema.array().default([]),
  character_classes: characterClassRawSchema.array().default([]),
  character_subclasses: characterSubclassSchema.array().default([]),
  creature_tags: creatureTagSchema.array().default([]),
  creatures: creatureRawSchema.array().default([]),
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
  source: sourceMetadataSchema.extend({
    include_ids: z.array(z.uuid()).default([]),
    required_ids: z.array(z.uuid()).default([]),
  }),
});

export type SourceBundle = z.infer<typeof sourceBundleSchema>;
