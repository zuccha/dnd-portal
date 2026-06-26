import z from "zod";
import type { TranslationFields } from "../../../resource";
import {
  defaultEquipmentModifier,
  equipmentModifierSchema,
  equipmentModifierTranslationFields,
} from "../equipment-modifier";

//------------------------------------------------------------------------------
// Weapon Modifier
//------------------------------------------------------------------------------

export const weaponModifierSchema = equipmentModifierSchema.extend({});

export type WeaponModifier = z.infer<typeof weaponModifierSchema>;

//------------------------------------------------------------------------------
// Default Weapon Modifier
//------------------------------------------------------------------------------

export const defaultWeaponModifier: WeaponModifier = {
  ...defaultEquipmentModifier,
};

//------------------------------------------------------------------------------
// Weapon Modifier Translation Fields
//------------------------------------------------------------------------------

export const weaponModifierTranslationFields: TranslationFields<WeaponModifier>[] =
  [...equipmentModifierTranslationFields];
