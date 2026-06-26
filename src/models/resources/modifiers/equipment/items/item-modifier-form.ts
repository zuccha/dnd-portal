import z from "zod";
import { createForm } from "~/utils/form";
import {
  equipmentModifierFormDataSchema,
  equipmentModifierFormDataToDB,
} from "../equipment-modifier-form";
import type {
  DBItemModifier,
  DBItemModifierTranslation,
} from "./db-item-modifier";

//------------------------------------------------------------------------------
// Item Modifier Form Data
//------------------------------------------------------------------------------

export const itemModifierFormDataSchema =
  equipmentModifierFormDataSchema.extend({});

export type ItemModifierFormData = z.infer<typeof itemModifierFormDataSchema>;

//------------------------------------------------------------------------------
// Item Modifier Form Data To DB
//------------------------------------------------------------------------------

export function itemModifierFormDataToDB(data: Partial<ItemModifierFormData>): {
  resource: Partial<DBItemModifier>;
  translation: Partial<DBItemModifierTranslation>;
} {
  return equipmentModifierFormDataToDB(data);
}

//------------------------------------------------------------------------------
// Item Modifier Form
//------------------------------------------------------------------------------

export const itemModifierForm = createForm(
  "item_modifier",
  itemModifierFormDataSchema.parse,
);
