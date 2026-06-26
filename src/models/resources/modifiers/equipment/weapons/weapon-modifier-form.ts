import z from "zod";
import { createForm } from "~/utils/form";
import {
  equipmentModifierFormDataSchema,
  equipmentModifierFormDataToDB,
} from "../equipment-modifier-form";
import type {
  DBWeaponModifier,
  DBWeaponModifierTranslation,
} from "./db-weapon-modifier";

//------------------------------------------------------------------------------
// Weapon Modifier Form Data
//------------------------------------------------------------------------------

export const weaponModifierFormDataSchema =
  equipmentModifierFormDataSchema.extend({});

export type WeaponModifierFormData = z.infer<
  typeof weaponModifierFormDataSchema
>;

//------------------------------------------------------------------------------
// Weapon Modifier Form Data To DB
//------------------------------------------------------------------------------

export function weaponModifierFormDataToDB(
  data: Partial<WeaponModifierFormData>,
): {
  resource: Partial<DBWeaponModifier>;
  translation: Partial<DBWeaponModifierTranslation>;
} {
  return equipmentModifierFormDataToDB(data);
}

//------------------------------------------------------------------------------
// Weapon Modifier Form
//------------------------------------------------------------------------------

export const weaponModifierForm = createForm(
  "weapon_modifier",
  weaponModifierFormDataSchema.parse,
);
