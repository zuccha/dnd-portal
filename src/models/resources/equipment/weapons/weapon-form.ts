import z from "zod";
import { createForm } from "~/utils/form";
import { damageTypeSchema } from "../../../types/damage-type";
import { weaponMasterySchema } from "../../../types/weapon-mastery";
import { weaponPropertySchema } from "../../../types/weapon-property";
import { weaponTypeSchema } from "../../../types/weapon-type";
import {
  equipmentFormDataSchema,
  equipmentFormDataToDB,
} from "../equipment-form";
import { type DBWeapon, type DBWeaponTranslation } from "./db-weapon";

//------------------------------------------------------------------------------
// Weapon Form Data
//------------------------------------------------------------------------------

export const weaponFormDataSchema = equipmentFormDataSchema.extend({
  ammunition_ids: z.array(z.uuid()),
  damage: z.string(),
  damage_type: damageTypeSchema,
  damage_versatile: z.string(),
  mastery: weaponMasterySchema,
  melee: z.boolean(),
  properties: z.array(weaponPropertySchema),
  range_long: z.number(),
  range_short: z.number(),
  ranged: z.boolean(),
  type: weaponTypeSchema,
});

export type WeaponFormData = z.infer<typeof weaponFormDataSchema>;

//------------------------------------------------------------------------------
// Weapon Form Data To DB
//------------------------------------------------------------------------------

export function weaponFormDataToDB(data: Partial<WeaponFormData>): {
  resource: Partial<DBWeapon>;
  translation: Partial<DBWeaponTranslation>;
} {
  const { resource, translation } = equipmentFormDataToDB(data);

  return {
    resource: {
      ...resource,
      ammunition_ids: data.ammunition_ids,
      damage: data.damage,
      damage_type: data.damage_type,
      damage_versatile: data.damage_versatile,
      mastery: data.mastery,
      melee: data.melee,
      properties: data.properties,
      range_long: data.range_long,
      range_short: data.range_short,
      ranged: data.ranged,
      rarity: data.rarity,
      type: data.type,
    },
    translation: {
      ...translation,
    },
  };
}

//------------------------------------------------------------------------------
// Weapon Form
//------------------------------------------------------------------------------

export const weaponForm = createForm("weapon", weaponFormDataSchema.parse);
