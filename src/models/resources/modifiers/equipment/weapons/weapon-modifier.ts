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

export const weaponModifierSchema = equipmentModifierSchema.extend({
  kind: z.literal("weapon_modifier"),
});

export type WeaponModifier = z.infer<typeof weaponModifierSchema>;

//------------------------------------------------------------------------------
// Default Weapon Modifier
//------------------------------------------------------------------------------

export const defaultWeaponModifier: WeaponModifier = {
  ...defaultEquipmentModifier,
  kind: "weapon_modifier",
};

//------------------------------------------------------------------------------
// Weapon Modifier Translation Fields
//------------------------------------------------------------------------------

export const weaponModifierTranslationFields: TranslationFields<WeaponModifier>[] =
  [...equipmentModifierTranslationFields];
