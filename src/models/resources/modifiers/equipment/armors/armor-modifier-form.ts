import z from "zod";
import { createForm } from "~/utils/form";
import {
  equipmentModifierFormDataSchema,
  equipmentModifierFormDataToResource,
} from "../equipment-modifier-form";
import type { ArmorModifier } from "./armor-modifier";

//------------------------------------------------------------------------------
// Armor Modifier Form Data
//------------------------------------------------------------------------------

export const armorModifierFormDataSchema =
  equipmentModifierFormDataSchema.extend({});

export type ArmorModifierFormData = z.infer<typeof armorModifierFormDataSchema>;

//------------------------------------------------------------------------------
// Armor Modifier Form Data To Resource
//------------------------------------------------------------------------------

export function armorModifierFormDataToResource(
  data: Partial<ArmorModifierFormData>,
  lang: string,
): Partial<ArmorModifier> {
  return equipmentModifierFormDataToResource(
    data,
    lang,
  ) as Partial<ArmorModifier>;
}

//------------------------------------------------------------------------------
// Armor Modifier Form
//------------------------------------------------------------------------------

export const armorModifierForm = createForm(
  "armor_modifier",
  armorModifierFormDataSchema.parse,
);
