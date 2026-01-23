import z from "zod";
import { damageTypeSchema } from "../../../types/damage-type";
import { weaponMasterySchema } from "../../../types/weapon-mastery";
import { weaponPropertySchema } from "../../../types/weapon-property";
import { weaponTypeSchema } from "../../../types/weapon-type";
import {
  dbEquipmentSchema,
  dbEquipmentTranslationSchema,
} from "../db-equipment";

//------------------------------------------------------------------------------
// DB Weapon
//------------------------------------------------------------------------------

export const dbWeaponSchema = dbEquipmentSchema.extend({
  ammunition_ids: z.array(z.uuid()),
  damage: z.string(),
  damage_type: damageTypeSchema,
  damage_versatile: z.string().nullish(),
  mastery: weaponMasterySchema,
  melee: z.boolean(),
  properties: z.array(weaponPropertySchema),
  range_long: z.number().nullish(),
  range_short: z.number().nullish(),
  ranged: z.boolean(),
  type: weaponTypeSchema,
});

export type DBWeapon = z.infer<typeof dbWeaponSchema>;

//------------------------------------------------------------------------------
// DB Weapon Translation
//------------------------------------------------------------------------------

export const dbWeaponTranslationSchema = dbEquipmentTranslationSchema.extend(
  {},
);

export type DBWeaponTranslation = z.infer<typeof dbWeaponTranslationSchema>;
