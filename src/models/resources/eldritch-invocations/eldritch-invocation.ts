import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { characterLevelSchema } from "../../types/character-level";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Eldritch Invocation
//------------------------------------------------------------------------------

export const eldritchInvocationSchema = resourceSchema.extend({
  description: i18nStringSchema,
  min_warlock_level: characterLevelSchema,
  prerequisite: i18nStringSchema,
});

export type EldritchInvocation = z.infer<typeof eldritchInvocationSchema>;

//------------------------------------------------------------------------------
// Default Eldritch Invocation
//------------------------------------------------------------------------------

export const defaultEldritchInvocation: EldritchInvocation = {
  ...defaultResource,
  description: {},
  min_warlock_level: 0,
  prerequisite: {},
};

//------------------------------------------------------------------------------
// Eldritch Invocation Translation Fields
//------------------------------------------------------------------------------

export const eldritchInvocationTranslationFields: TranslationFields<EldritchInvocation>[] =
  [...resourceTranslationFields, "description", "prerequisite"];
