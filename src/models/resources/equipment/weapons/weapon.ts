import z from "zod";
import { damageTypeSchema } from "../../../types/damage-type";
import { weaponMasterySchema } from "../../../types/weapon-mastery";
import { weaponPropertySchema } from "../../../types/weapon-property";
import { weaponTypeSchema } from "../../../types/weapon-type";
import type { TranslationFields } from "../../resource";
import {
  defaultEquipment,
  equipmentSchema,
  equipmentTranslationFields,
} from "../equipment";

//------------------------------------------------------------------------------
// Weapon
//------------------------------------------------------------------------------

export const weaponSchema = equipmentSchema.extend({
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

export type Weapon = z.infer<typeof weaponSchema>;

//------------------------------------------------------------------------------
// Default Weapon
//------------------------------------------------------------------------------

export const defaultWeapon: Weapon = {
  ...defaultEquipment,
  ammunition_ids: [],
  damage: "",
  damage_type: "slashing",
  damage_versatile: undefined,
  mastery: "cleave",
  melee: true,
  properties: [],
  range_long: undefined,
  range_short: undefined,
  ranged: false,
  type: "simple",
};

//------------------------------------------------------------------------------
// Weapon Translation Fields
//------------------------------------------------------------------------------

export const weaponTranslationFields: TranslationFields<Weapon>[] = [
  ...equipmentTranslationFields,
];
