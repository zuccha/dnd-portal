import z from "zod";
import { createForm } from "~/utils/form";
import {
  equipmentModifierFormDataSchema,
  equipmentModifierFormDataToDB,
} from "../equipment-modifier-form";
import type {
  DBToolModifier,
  DBToolModifierTranslation,
} from "./db-tool-modifier";

//------------------------------------------------------------------------------
// Tool Modifier Form Data
//------------------------------------------------------------------------------

export const toolModifierFormDataSchema =
  equipmentModifierFormDataSchema.extend({});

export type ToolModifierFormData = z.infer<typeof toolModifierFormDataSchema>;

//------------------------------------------------------------------------------
// Tool Modifier Form Data To DB
//------------------------------------------------------------------------------

export function toolModifierFormDataToDB(data: Partial<ToolModifierFormData>): {
  resource: Partial<DBToolModifier>;
  translation: Partial<DBToolModifierTranslation>;
} {
  return equipmentModifierFormDataToDB(data);
}

//------------------------------------------------------------------------------
// Tool Modifier Form
//------------------------------------------------------------------------------

export const toolModifierForm = createForm(
  "tool_modifier",
  toolModifierFormDataSchema.parse,
);
