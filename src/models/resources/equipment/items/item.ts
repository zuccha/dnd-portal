import z from "zod";
import { itemTypeSchema } from "../../../types/item-type";
import type { TranslationFields } from "../../resource";
import {
  defaultEquipment,
  equipmentSchema,
  equipmentTranslationFields,
} from "../equipment";

//------------------------------------------------------------------------------
// Item
//------------------------------------------------------------------------------

export const itemSchema = equipmentSchema.extend({
  type: itemTypeSchema,
});

export type Item = z.infer<typeof itemSchema>;

//------------------------------------------------------------------------------
// Default Item
//------------------------------------------------------------------------------

export const defaultItem: Item = {
  ...defaultEquipment,

  type: "other",
};

//------------------------------------------------------------------------------
// Item Translation Fields
//------------------------------------------------------------------------------

export const itemTranslationFields: TranslationFields<Item>[] = [
  ...equipmentTranslationFields,
];
