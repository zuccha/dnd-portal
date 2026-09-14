import z from "zod";
import { createForm } from "~/utils/form";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Metamagic } from "./metamagic";

//------------------------------------------------------------------------------
// Metamagic Form Data
//------------------------------------------------------------------------------

export const metamagicFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  name: z.string().default(""),
  page: z.number().default(0),
  prerequisite: z.string().default(""),
  sorcery_points: z.number().int().min(0).default(1),
});

export type MetamagicFormData = z.infer<typeof metamagicFormDataSchema>;

//------------------------------------------------------------------------------
// Metamagic Form Data To Resource
//------------------------------------------------------------------------------

export function metamagicFormDataToResource(
  data: Partial<MetamagicFormData>,
  lang: string,
): Partial<Metamagic> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    description: createResourceFormDataI18nValue(data.description, lang),
    prerequisite: createResourceFormDataI18nValue(data.prerequisite, lang),
    sorcery_points: data.sorcery_points,
  });
}

//------------------------------------------------------------------------------
// Metamagic Form
//------------------------------------------------------------------------------

export const metamagicForm = createForm("metamagic", metamagicFormDataSchema.parse);
