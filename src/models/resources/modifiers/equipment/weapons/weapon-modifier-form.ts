import z from "zod";
import { createForm } from "~/utils/form";
import {
  equipmentModifierFormDataSchema,
  equipmentModifierFormDataToResource,
} from "../equipment-modifier-form";
import type { WeaponModifier } from "./weapon-modifier";

//------------------------------------------------------------------------------
// Weapon Modifier Form Data
//------------------------------------------------------------------------------

export const weaponModifierFormDataSchema =
  equipmentModifierFormDataSchema.extend({});

export type WeaponModifierFormData = z.infer<
  typeof weaponModifierFormDataSchema
>;

//------------------------------------------------------------------------------
// Weapon Modifier Form Data To Resource
//------------------------------------------------------------------------------

export function weaponModifierFormDataToResource(
  data: Partial<WeaponModifierFormData>,
  lang: string,
): Partial<WeaponModifier> {
  return equipmentModifierFormDataToResource(
    data,
    lang,
  ) as Partial<WeaponModifier>;
}

//------------------------------------------------------------------------------
// Weapon Modifier Form
//------------------------------------------------------------------------------

export const weaponModifierForm = createForm(
  "weapon_modifier",
  weaponModifierFormDataSchema.parse,
);
