import z from "zod";
import {
  defaultEquipmentModifier,
  equipmentModifierSchema,
  equipmentModifierTranslationFields,
} from "../equipment-modifier";
import type { TranslationFields } from "../../../resource";

//------------------------------------------------------------------------------
// Tool Modifier
//------------------------------------------------------------------------------

export const toolModifierSchema = equipmentModifierSchema.extend({
  kind: z.literal("tool_modifier"),
});

export type ToolModifier = z.infer<typeof toolModifierSchema>;

//------------------------------------------------------------------------------
// Default Tool Modifier
//------------------------------------------------------------------------------

export const defaultToolModifier: ToolModifier = {
  ...defaultEquipmentModifier,
  kind: "tool_modifier",
};

//------------------------------------------------------------------------------
// Tool Modifier Translation Fields
//------------------------------------------------------------------------------

export const toolModifierTranslationFields: TranslationFields<ToolModifier>[] = [
  ...equipmentModifierTranslationFields,
];
