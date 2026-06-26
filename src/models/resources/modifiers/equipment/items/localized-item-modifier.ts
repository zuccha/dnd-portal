import z from "zod";
import {
  createLocalizedEquipmentModifierSchema,
  useLocalizeEquipmentModifier,
} from "../localized-equipment-modifier";
import { type ItemModifier, itemModifierSchema } from "./item-modifier";

//------------------------------------------------------------------------------
// Localized Item Modifier
//------------------------------------------------------------------------------

export const localizedItemModifierSchema =
  createLocalizedEquipmentModifierSchema(itemModifierSchema).extend({});

export type LocalizedItemModifier = z.infer<typeof localizedItemModifierSchema>;

//------------------------------------------------------------------------------
// Use Localize Item Modifier
//------------------------------------------------------------------------------

export function useLocalizeItemModifier() {
  return useLocalizeEquipmentModifier<ItemModifier>();
}
