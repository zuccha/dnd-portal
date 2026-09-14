import z from "zod";
import { createForm } from "~/utils/form";
import {
  equipmentModifierFormDataSchema,
  equipmentModifierFormDataToResource,
} from "../equipment-modifier-form";
import type { ToolModifier } from "./tool-modifier";

//------------------------------------------------------------------------------
// Tool Modifier Form Data
//------------------------------------------------------------------------------

export const toolModifierFormDataSchema = equipmentModifierFormDataSchema.extend({});

export type ToolModifierFormData = z.infer<typeof toolModifierFormDataSchema>;

//------------------------------------------------------------------------------
// Tool Modifier Form Data To Resource
//------------------------------------------------------------------------------

export function toolModifierFormDataToResource(
  data: Partial<ToolModifierFormData>,
  lang: string,
): Partial<ToolModifier> {
  return equipmentModifierFormDataToResource(data, lang) as Partial<ToolModifier>;
}

//------------------------------------------------------------------------------
// Tool Modifier Form
//------------------------------------------------------------------------------

export const toolModifierForm = createForm("tool_modifier", toolModifierFormDataSchema.parse);
