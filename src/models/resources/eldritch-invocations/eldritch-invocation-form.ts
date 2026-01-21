import z from "zod";
import { createForm } from "~/utils/form";
import { characterLevelSchema } from "../../types/character-level";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import {
  type DBEldritchInvocation,
  type DBEldritchInvocationTranslation,
} from "./db-eldritch-invocation";

//------------------------------------------------------------------------------
// Character Class Form Data
//------------------------------------------------------------------------------

export const eldritchInvocationFormDataSchema = resourceFormDataSchema.extend({
  description: z.string(),
  min_warlock_level: characterLevelSchema,
  name: z.string(),
  page: z.number(),
  prerequisite: z.string(),
});

export type EldritchInvocationFormData = z.infer<
  typeof eldritchInvocationFormDataSchema
>;

//------------------------------------------------------------------------------
// Character Class Form Data To DB
//------------------------------------------------------------------------------

export function eldritchInvocationFormDataToDB(
  data: Partial<EldritchInvocationFormData>,
): {
  resource: Partial<DBEldritchInvocation>;
  translation: Partial<DBEldritchInvocationTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      min_warlock_level: data.min_warlock_level,
    },
    translation: {
      ...translation,
      description: data.description,
      prerequisite: data.prerequisite,
    },
  };
}

//------------------------------------------------------------------------------
// Character Class Form
//------------------------------------------------------------------------------

export const eldritchInvocationForm = createForm(
  "eldritch_invocation",
  eldritchInvocationFormDataSchema.parse,
);
