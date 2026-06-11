import z from "zod";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureSkillSchema } from "../../types/creature-skill";
import { startingEquipmentEntrySchema } from "../character-classes/starting-equipment";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Background
//------------------------------------------------------------------------------

export const dbBackgroundSchema = dbResourceSchema.extend({
  ability_scores: z.array(creatureAbilitySchema),
  feat_id: z.uuid().nullable(),
  skill_proficiencies: z.array(creatureSkillSchema),
  starting_equipment_entries: z.array(startingEquipmentEntrySchema),
  tool_proficiency_id: z.uuid().nullable(),
});

export type DBBackground = z.infer<typeof dbBackgroundSchema>;

//------------------------------------------------------------------------------
// DB Background Translation
//------------------------------------------------------------------------------

export const dbBackgroundTranslationSchema = dbResourceTranslationSchema;

export type DBBackgroundTranslation = z.infer<
  typeof dbBackgroundTranslationSchema
>;

