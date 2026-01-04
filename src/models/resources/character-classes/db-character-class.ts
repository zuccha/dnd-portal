import z from "zod";
import { armorTypeSchema } from "../../types/armor-type";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureSkillSchema } from "../../types/creature-skill";
import { dieTypeSchema } from "../../types/die_type";
import { weaponTypeSchema } from "../../types/weapon-type";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";
import { startingEquipmentEntrySchema } from "./starting-equipment";

//------------------------------------------------------------------------------
// DB Character Class
//------------------------------------------------------------------------------

export const dbCharacterClassSchema = dbResourceSchema.extend({
  armor_proficiencies: z.array(armorTypeSchema),
  hp_die: dieTypeSchema,
  primary_abilities: z.array(creatureAbilitySchema),
  saving_throw_proficiencies: z.array(creatureAbilitySchema),
  skill_proficiencies_pool: z.array(creatureSkillSchema),
  skill_proficiencies_pool_quantity: z.number(),
  spell_ids: z.array(z.uuid()),
  starting_equipment_entries: z.array(startingEquipmentEntrySchema),
  tool_proficiency_ids: z.array(z.uuid()),
  weapon_proficiencies: z.array(weaponTypeSchema),
});

export type DBCharacterClass = z.infer<typeof dbCharacterClassSchema>;

//------------------------------------------------------------------------------
// DB Character Class Translation
//------------------------------------------------------------------------------

export const dbCharacterClassTranslationSchema =
  dbResourceTranslationSchema.extend({
    armor_proficiencies_extra: z.string(),
    weapon_proficiencies_extra: z.string(),
  });

export type DBCharacterClassTranslation = z.infer<
  typeof dbCharacterClassTranslationSchema
>;
