import z from "zod";
import type { TranslationFields } from "../../../resource";
import {
  defaultEquipmentModifier,
  equipmentModifierSchema,
  equipmentModifierTranslationFields,
} from "../equipment-modifier";

//------------------------------------------------------------------------------
// Item Modifier
//------------------------------------------------------------------------------

export const itemModifierSchema = equipmentModifierSchema.extend({
  kind: z.literal("item_modifier"),
});

export type ItemModifier = z.infer<typeof itemModifierSchema>;

//------------------------------------------------------------------------------
// Default Item Modifier
//------------------------------------------------------------------------------

export const defaultItemModifier: ItemModifier = {
  ...defaultEquipmentModifier,
  kind: "item_modifier",
};

//------------------------------------------------------------------------------
// Item Modifier Translation Fields
//------------------------------------------------------------------------------

export const itemModifierTranslationFields: TranslationFields<ItemModifier>[] =
  [...equipmentModifierTranslationFields];
