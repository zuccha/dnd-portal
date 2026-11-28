import z from "zod";
import { createForm } from "~/utils/form";
import { relicTypeSchema } from "../../types/relic-type";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Relic } from "./relic";

//------------------------------------------------------------------------------
// Relic Form Data
//------------------------------------------------------------------------------

export const relicFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  equipment_id: z.uuid().nullable().default(null),
  type: relicTypeSchema.default("other"),
});

//------------------------------------------------------------------------------
// Relic Form Data Type
//------------------------------------------------------------------------------

export type RelicFormData = z.infer<typeof relicFormDataSchema>;

//------------------------------------------------------------------------------
// Relic Form Data To Resource
//------------------------------------------------------------------------------

export function relicFormDataToResource(
  data: Partial<RelicFormData>,
  lang: string,
): Partial<Relic> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    description: createResourceFormDataI18nValue(data.description, lang),
    equipment_id: data.equipment_id,
    type: data.type,
  });
}

//------------------------------------------------------------------------------
// Relic Form
//------------------------------------------------------------------------------

export const relicForm = createForm("relic", relicFormDataSchema.parse);
