import z from "zod";
import type { TranslationFields } from "../../resource";
import {
  defaultEquipment,
  equipmentSchema,
  equipmentTranslationFields,
} from "../equipment";

//------------------------------------------------------------------------------
// Item
//------------------------------------------------------------------------------

export const itemSchema = equipmentSchema.extend({});

export type Item = z.infer<typeof itemSchema>;

//------------------------------------------------------------------------------
// Default Item
//------------------------------------------------------------------------------

export const defaultItem: Item = {
  ...defaultEquipment,
};

//------------------------------------------------------------------------------
// Item Translation Fields
//------------------------------------------------------------------------------

export const itemTranslationFields: TranslationFields<Item>[] = [
  ...equipmentTranslationFields,
];
