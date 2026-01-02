import z from "zod";
import type { I18nNumber } from "~/i18n/i18n-number";
import { type I18nString, i18nStringSchema } from "~/i18n/i18n-string";
import type { KeysOfType } from "~/types";
import { characterLevelSchema } from "../../types/character-level";
import { resourceSchema, resourceTranslationFields } from "../resource";

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

export const eldritchInvocationTranslationFields: KeysOfType<
  EldritchInvocation,
  I18nNumber | I18nString
>[] = [...resourceTranslationFields, "description", "prerequisite"];
