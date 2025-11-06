import z from "zod";
import { i18nStringSchema } from "../i18n/i18n-string";
import { resourceFiltersSchema, resourceSchema } from "./resource";
import { characterLevelSchema } from "./types/character-level";

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
// Eldritch Invocation Filters
//------------------------------------------------------------------------------

export const eldritchInvocationFiltersSchema = resourceFiltersSchema.extend({
  warlock_level: z.number().optional(),
});

export type EldritchInvocationFilters = z.infer<
  typeof eldritchInvocationFiltersSchema
>;

//------------------------------------------------------------------------------
// Default Eldritch Invocation
//------------------------------------------------------------------------------

export const defaultEldritchInvocation: EldritchInvocation = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  min_warlock_level: 0,

  description: {},
  name: {},
  prerequisite: {},

  visibility: "game_master",
};

//------------------------------------------------------------------------------
// Default Eldritch Invocation Filters
//------------------------------------------------------------------------------

export const defaultEldritchInvocationFilters: EldritchInvocationFilters = {
  order_by: "name",
  order_dir: "asc",
};
