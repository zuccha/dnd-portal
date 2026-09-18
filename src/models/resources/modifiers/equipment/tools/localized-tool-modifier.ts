import z from "zod";
import { localizedEquipmentModifierSchema } from "../localized-equipment-modifier";
import { toolModifierSchema } from "./tool-modifier";

//------------------------------------------------------------------------------
// Localized Tool Modifier
//------------------------------------------------------------------------------

export const localizedToolModifierSchema = localizedEquipmentModifierSchema(
  toolModifierSchema,
  z.literal("tool_modifier"),
).extend({});

export type LocalizedToolModifier = z.infer<typeof localizedToolModifierSchema>;
