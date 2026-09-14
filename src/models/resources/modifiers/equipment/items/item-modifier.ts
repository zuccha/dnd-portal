import z from "zod";
import {
  defaultEquipmentModifier,
  equipmentModifierSchema,
  equipmentModifierTranslationFields,
} from "../equipment-modifier";
import type { TranslationFields } from "../../../resource";

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

export const itemModifierTranslationFields: TranslationFields<ItemModifier>[] = [
  ...equipmentModifierTranslationFields,
];
