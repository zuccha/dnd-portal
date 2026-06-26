import z from "zod";
import {
  createLocalizedEquipmentModifierSchema,
  useLocalizeEquipmentModifier,
} from "../localized-equipment-modifier";
import { type ToolModifier, toolModifierSchema } from "./tool-modifier";

//------------------------------------------------------------------------------
// Localized Tool Modifier
//------------------------------------------------------------------------------

export const localizedToolModifierSchema =
  createLocalizedEquipmentModifierSchema(toolModifierSchema).extend({});

export type LocalizedToolModifier = z.infer<typeof localizedToolModifierSchema>;

//------------------------------------------------------------------------------
// Use Localize Tool Modifier
//------------------------------------------------------------------------------

export function useLocalizeToolModifier() {
  return useLocalizeEquipmentModifier<ToolModifier>();
}
