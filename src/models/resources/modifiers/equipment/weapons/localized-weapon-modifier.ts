import z from "zod";
import {
  createLocalizedEquipmentModifierSchema,
  useLocalizeEquipmentModifier,
} from "../localized-equipment-modifier";
import { type WeaponModifier, weaponModifierSchema } from "./weapon-modifier";

//------------------------------------------------------------------------------
// Localized Weapon Modifier
//------------------------------------------------------------------------------

export const localizedWeaponModifierSchema =
  createLocalizedEquipmentModifierSchema(weaponModifierSchema).extend({});

export type LocalizedWeaponModifier = z.infer<
  typeof localizedWeaponModifierSchema
>;

//------------------------------------------------------------------------------
// Use Localize Weapon Modifier
//------------------------------------------------------------------------------

export function useLocalizeWeaponModifier() {
  return useLocalizeEquipmentModifier<WeaponModifier>();
}
