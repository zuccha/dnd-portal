import z from "zod";
import { damageTypeSchema } from "./damage-type";
import { weaponMasterySchema } from "./weapon-mastery";
import { weaponPropertySchema } from "./weapon-property";
import { weaponTypeSchema } from "./weapon-type";

//------------------------------------------------------------------------------
// DBWeapon
//------------------------------------------------------------------------------

export const dbWeaponSchema = z.object({
  id: z.uuid(),

  campaign_id: z.string(),

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

export const dbWeaponTranslationSchema = z.object({
  lang: z.string(),
  weapon_id: z.uuid(),

  ammunition: z.string().nullish(),
  name: z.string(),
  notes: z.string().nullish(),
  page: z.string().nullish(),
});

export type DBWeaponTranslation = z.infer<typeof dbWeaponTranslationSchema>;
