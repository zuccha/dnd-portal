import z from "zod";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Modifier } from "./modifier";

//------------------------------------------------------------------------------
// Modifier Form Data Patch
//------------------------------------------------------------------------------

export type ModifierFormDataPatch = Partial<Omit<Modifier, "kind">>;

//------------------------------------------------------------------------------
// Modifier Form Data
//------------------------------------------------------------------------------

export const modifierFormDataSchema = resourceFormDataSchema.extend({
  applies_to: z.string().default(""),
  composite_name: z.string().default("{1}"),
});

export type ModifierFormData = z.infer<typeof modifierFormDataSchema>;

//------------------------------------------------------------------------------
// Modifier Form Data To Resource
//------------------------------------------------------------------------------

export function modifierFormDataToResource(
  data: Partial<ModifierFormData>,
  lang: string,
): ModifierFormDataPatch {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    applies_to: createResourceFormDataI18nValue(data.applies_to, lang),
    composite_name: createResourceFormDataI18nValue(data.composite_name, lang),
  });
}
