import z from "zod";
import { createForm } from "~/utils/form";
import {
  equipmentModifierFormDataSchema,
  equipmentModifierFormDataToResource,
} from "../equipment-modifier-form";
import type { ItemModifier } from "./item-modifier";

//------------------------------------------------------------------------------
// Item Modifier Form Data
//------------------------------------------------------------------------------

export const itemModifierFormDataSchema =
  equipmentModifierFormDataSchema.extend({});

export type ItemModifierFormData = z.infer<typeof itemModifierFormDataSchema>;

//------------------------------------------------------------------------------
// Item Modifier Form Data To Resource
//------------------------------------------------------------------------------

export function itemModifierFormDataToResource(
  data: Partial<ItemModifierFormData>,
  lang: string,
): Partial<ItemModifier> {
  return equipmentModifierFormDataToResource(
    data,
    lang,
  ) as Partial<ItemModifier>;
}

//------------------------------------------------------------------------------
// Item Modifier Form
//------------------------------------------------------------------------------

export const itemModifierForm = createForm(
  "item_modifier",
  itemModifierFormDataSchema.parse,
);
