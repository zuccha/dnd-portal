import z from "zod";
import { dbResourceSchema, dbResourceTranslationSchema } from "./db-resource";
import { damageTypeSchema } from "./types/damage-type";
import { weaponMasterySchema } from "./types/weapon-mastery";
import { weaponPropertySchema } from "./types/weapon-property";
import { weaponTypeSchema } from "./types/weapon-type";

//------------------------------------------------------------------------------
// DB Weapon
//------------------------------------------------------------------------------

export const dbWeaponSchema = dbResourceSchema.extend({
  type: weaponTypeSchema,

  damage: z.string(),
  damage_type: damageTypeSchema,
  damage_versatile: z.string().nullish(),

  mastery: weaponMasterySchema,
  properties: z.array(weaponPropertySchema),

  magic: z.boolean(),
  melee: z.boolean(),
  ranged: z.boolean(),

  range_ft_long: z.number().nullish(),
  range_ft_short: z.number().nullish(),
  range_m_long: z.number().nullish(),
  range_m_short: z.number().nullish(),

  weight_kg: z.number(),
  weight_lb: z.number(),

  cost: z.number(),
});

export type DBWeapon = z.infer<typeof dbWeaponSchema>;

//------------------------------------------------------------------------------
// DB Weapon Translation
//------------------------------------------------------------------------------

export const dbWeaponTranslationSchema = dbResourceTranslationSchema.extend({
  weapon_id: z.uuid(),

  ammunition: z.string().nullish(),
  notes: z.string().nullish(),
});

export type DBWeaponTranslation = z.infer<typeof dbWeaponTranslationSchema>;
