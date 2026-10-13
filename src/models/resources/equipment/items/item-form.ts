import z from "zod";
import { createForm } from "~/utils/form";
import { itemTypeSchema } from "../../../types/item-type";
import { createResourceFormDataPatch, type ResourceFormOutput } from "../../resource-form";
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

export function itemFormDataToResource(
  data: Partial<ItemFormData>,
  lang: string,
): ResourceFormOutput<Item> {
  const base = equipmentFormDataToResource(data, lang);
  const resource = createResourceFormDataPatch({
    ...base.resource,
    charges: data.charges === undefined ? undefined : (data.charges ?? null),
    consumable: data.consumable,
    type: data.type,
  });
  return { resource, relations: base.relations };
}

//------------------------------------------------------------------------------
// Item Form
//------------------------------------------------------------------------------

export const itemForm = createForm("item", itemFormDataSchema.parse);
