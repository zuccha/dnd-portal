import z from "zod";
import { createForm } from "~/utils/form";
import { characterLevelSchema } from "../../types/character-level";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { EldritchInvocation } from "./eldritch-invocation";

//------------------------------------------------------------------------------
// Character Class Form Data
//------------------------------------------------------------------------------

export const eldritchInvocationFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  minimum_warlock_level: characterLevelSchema.default(0),
  prerequisite: z.string().default(""),
});

export type EldritchInvocationFormData = z.infer<typeof eldritchInvocationFormDataSchema>;

//------------------------------------------------------------------------------
// Character Class Form Data To Resource
//------------------------------------------------------------------------------

export function eldritchInvocationFormDataToResource(
  data: Partial<EldritchInvocationFormData>,
  lang: string,
): Partial<EldritchInvocation> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    description: createResourceFormDataI18nValue(data.description, lang),
    minimum_warlock_level: data.minimum_warlock_level,
    prerequisite: createResourceFormDataI18nValue(data.prerequisite, lang),
  });
}

//------------------------------------------------------------------------------
// Character Class Form
//------------------------------------------------------------------------------

export const eldritchInvocationForm = createForm(
  "eldritch_invocation",
  eldritchInvocationFormDataSchema.parse,
);
