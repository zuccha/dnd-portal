import z from "zod";
import { createForm } from "~/utils/form";
import { itemTypeSchema } from "../../../types/item-type";
import { createResourceFormDataPatch } from "../../resource-form";
import { equipmentFormDataSchema, equipmentFormDataToResource } from "../equipment-form";
import type { Item } from "./item";

//------------------------------------------------------------------------------
// Item Form Data
//------------------------------------------------------------------------------

export const itemFormDataSchema = equipmentFormDataSchema.extend({
  charges: z.number().default(0),
  consumable: z.boolean().default(false),
  type: itemTypeSchema.default("other"),
});

export type ItemFormData = z.infer<typeof itemFormDataSchema>;

//------------------------------------------------------------------------------
// Item Form Data To Resource
//------------------------------------------------------------------------------

export function itemFormDataToResource(data: Partial<ItemFormData>, lang: string): Partial<Item> {
  return createResourceFormDataPatch({
    ...equipmentFormDataToResource(data, lang),
    charges: data.charges === undefined ? undefined : (data.charges ?? null),
    consumable: data.consumable,
    type: data.type,
  });
}

//------------------------------------------------------------------------------
// Item Form
//------------------------------------------------------------------------------

export const itemForm = createForm("item", itemFormDataSchema.parse);
