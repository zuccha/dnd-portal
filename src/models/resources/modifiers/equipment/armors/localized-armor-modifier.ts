import z from "zod";
import { localizedEquipmentModifierSchema } from "../localized-equipment-modifier";
import { armorModifierSchema } from "./armor-modifier";

//------------------------------------------------------------------------------
// Localized Armor Modifier
//------------------------------------------------------------------------------

export const localizedArmorModifierSchema = localizedEquipmentModifierSchema(
  armorModifierSchema,
  z.literal("armor_modifier"),
).extend({});

export type LocalizedArmorModifier = z.infer<typeof localizedArmorModifierSchema>;
