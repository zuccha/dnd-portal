import z from "zod";
import { armorTypeSchema } from "../../types/armor-type";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Armor
//------------------------------------------------------------------------------

export const dbArmorSchema = dbResourceSchema.extend({
  armor_class_max_cha_modifier: z.number().nullish(),
  armor_class_max_con_modifier: z.number().nullish(),
  armor_class_max_dex_modifier: z.number().nullish(),
  armor_class_max_int_modifier: z.number().nullish(),
  armor_class_max_str_modifier: z.number().nullish(),
  armor_class_max_wis_modifier: z.number().nullish(),
  armor_class_modifier: z.number(),
  base_armor_class: z.number(),
  cost: z.number(),
  disadvantage_on_stealth: z.boolean(),
  required_cha: z.number(),
  required_con: z.number(),
  required_dex: z.number(),
  required_int: z.number(),
  required_str: z.number(),
  required_wis: z.number(),
  type: armorTypeSchema,
  weight: z.number(),
});

export type DBArmor = z.infer<typeof dbArmorSchema>;

//------------------------------------------------------------------------------
// DB Armor Translation
//------------------------------------------------------------------------------

export const dbArmorTranslationSchema = dbResourceTranslationSchema.extend({
  notes: z.string().nullish(),
});

export type DBArmorTranslation = z.infer<typeof dbArmorTranslationSchema>;
