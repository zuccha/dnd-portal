import z from "zod";
import { creatureHabitatSchema } from "../../types/creature-habitat";
import { creatureTreasureSchema } from "../../types/creature-treasure";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Creature Family
//------------------------------------------------------------------------------

export const creatureFamilySchema = resourceSchema.extend({
  habitats: z.array(creatureHabitatSchema).default([]),
  kind: z.literal("creature_family"),
  plane_ids: z.array(z.uuid()).default([]),
  treasures: z.array(creatureTreasureSchema).default([]),
});

export type CreatureFamily = z.infer<typeof creatureFamilySchema>;

//------------------------------------------------------------------------------
// Default Creature Family
//------------------------------------------------------------------------------

export const defaultCreatureFamily: CreatureFamily = {
  ...defaultResource,
  habitats: [],
  kind: "creature_family",
  plane_ids: [],
  treasures: [],
};

//------------------------------------------------------------------------------
// Creature Family Translation Fields
//------------------------------------------------------------------------------

export const creatureFamilyTranslationFields: TranslationFields<CreatureFamily>[] = [
  ...resourceTranslationFields,
];
