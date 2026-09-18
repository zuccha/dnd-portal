import z from "zod";
import { localizedEquipmentModifierSchema } from "../localized-equipment-modifier";
import { itemModifierSchema } from "./item-modifier";

//------------------------------------------------------------------------------
// Localized Item Modifier
//------------------------------------------------------------------------------

export const localizedItemModifierSchema = localizedEquipmentModifierSchema(
  itemModifierSchema,
  z.literal("item_modifier"),
).extend({});

export type LocalizedItemModifier = z.infer<typeof localizedItemModifierSchema>;
