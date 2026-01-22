import z from "zod";
import { createForm } from "~/utils/form";
import {
  equipmentFormDataSchema,
  equipmentFormDataToDB,
} from "../equipment-form";
import { type DBItem, type DBItemTranslation } from "./db-item";

//------------------------------------------------------------------------------
// Item Form Data
//------------------------------------------------------------------------------

export const itemFormDataSchema = equipmentFormDataSchema.extend({});

export type ItemFormData = z.infer<typeof itemFormDataSchema>;

//------------------------------------------------------------------------------
// Item Form Data To DB
//------------------------------------------------------------------------------

export function itemFormDataToDB(data: Partial<ItemFormData>): {
  resource: Partial<DBItem>;
  translation: Partial<DBItemTranslation>;
} {
  const { resource, translation } = equipmentFormDataToDB(data);

  return {
    resource: {
      ...resource,
    },
    translation: {
      ...translation,
    },
  };
}

//------------------------------------------------------------------------------
// Item Form
//------------------------------------------------------------------------------

export const itemForm = createForm("item", itemFormDataSchema.parse);
