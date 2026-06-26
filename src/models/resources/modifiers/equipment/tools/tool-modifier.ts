import z from "zod";
import type { TranslationFields } from "../../../resource";
import {
  defaultEquipmentModifier,
  equipmentModifierSchema,
  equipmentModifierTranslationFields,
} from "../equipment-modifier";

//------------------------------------------------------------------------------
// Tool Modifier
//------------------------------------------------------------------------------

export const toolModifierSchema = equipmentModifierSchema.extend({});

export type ToolModifier = z.infer<typeof toolModifierSchema>;

//------------------------------------------------------------------------------
// Default Tool Modifier
//------------------------------------------------------------------------------

export const defaultToolModifier: ToolModifier = {
  ...defaultEquipmentModifier,
};

//------------------------------------------------------------------------------
// Tool Modifier Translation Fields
//------------------------------------------------------------------------------

export const toolModifierTranslationFields: TranslationFields<ToolModifier>[] =
  [...equipmentModifierTranslationFields];
