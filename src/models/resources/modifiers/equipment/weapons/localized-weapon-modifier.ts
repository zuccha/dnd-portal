import z from "zod";
import { localizedEquipmentModifierSchema } from "../localized-equipment-modifier";
import { weaponModifierSchema } from "./weapon-modifier";

//------------------------------------------------------------------------------
// Localized Weapon Modifier
//------------------------------------------------------------------------------

export const localizedWeaponModifierSchema = localizedEquipmentModifierSchema(
  weaponModifierSchema,
  z.literal("weapon_modifier"),
).extend({});

export type LocalizedWeaponModifier = z.infer<typeof localizedWeaponModifierSchema>;
