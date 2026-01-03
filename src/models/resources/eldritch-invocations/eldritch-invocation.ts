import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { characterLevelSchema } from "../../types/character-level";
import {
  type TranslationFields,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Eldritch Invocation
//------------------------------------------------------------------------------

export const eldritchInvocationSchema = resourceSchema.extend({
  min_warlock_level: characterLevelSchema,

  description: i18nStringSchema,
  prerequisite: i18nStringSchema,
});

export type EldritchInvocation = z.infer<typeof eldritchInvocationSchema>;

//------------------------------------------------------------------------------
// Default Eldritch Invocation
//------------------------------------------------------------------------------

export const defaultEldritchInvocation: EldritchInvocation = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  min_warlock_level: 0,

  page: {},

  description: {},
  name: {},
  prerequisite: {},

  visibility: "game_master",
};

//------------------------------------------------------------------------------
// Eldritch Invocation Translation Fields
//------------------------------------------------------------------------------

export const eldritchInvocationTranslationFields: TranslationFields<EldritchInvocation>[] =
  [...resourceTranslationFields, "description", "prerequisite"];
