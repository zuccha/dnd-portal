import z from "zod";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import type { DBModifier, DBModifierTranslation } from "./db-modifier";

//------------------------------------------------------------------------------
// Modifier Form Data
//------------------------------------------------------------------------------

export const modifierFormDataSchema = resourceFormDataSchema.extend({
  applies_to: z.string().default(""),
  composite_name: z.string().default("{1}"),
});

export type ModifierFormData = z.infer<typeof modifierFormDataSchema>;

//------------------------------------------------------------------------------
// Modifier Form Data To DB
//------------------------------------------------------------------------------

export function modifierFormDataToDB(data: Partial<ModifierFormData>): {
  resource: Partial<DBModifier>;
  translation: Partial<DBModifierTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource,
    translation: {
      ...translation,
      applies_to: data.applies_to,
      composite_name: data.composite_name,
    },
  };
}
