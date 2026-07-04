import z from "zod";
import {
  localizedEquipmentModifierSchema,
  useLocalizeEquipmentModifier,
} from "../localized-equipment-modifier";
import { type WeaponModifier, weaponModifierSchema } from "./weapon-modifier";

//------------------------------------------------------------------------------
// Localized Weapon Modifier
//------------------------------------------------------------------------------

export const localizedWeaponModifierSchema = localizedEquipmentModifierSchema(
  weaponModifierSchema,
  z.literal("weapon_modifier"),
).extend({});

export type LocalizedWeaponModifier = z.infer<
  typeof localizedWeaponModifierSchema
>;

//------------------------------------------------------------------------------
// Use Localize Weapon Modifier
//------------------------------------------------------------------------------

export function useLocalizeWeaponModifier() {
  return useLocalizeEquipmentModifier<WeaponModifier>();
}
