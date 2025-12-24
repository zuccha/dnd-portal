import { z } from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { timeSchema } from "~/i18n/i18n-time";
import { characterClassSchema } from "../../types/character-class";
import { spellCastingTimeSchema } from "../../types/spell-casting-time";
import { spellDurationSchema } from "../../types/spell-duration";
import {
  spellLevelSchema,
  spellLevelStringSchema,
} from "../../types/spell-level";
import { spellRangeSchema } from "../../types/spell-range";
import { spellSchoolSchema } from "../../types/spell-school";
import { resourceFiltersSchema, resourceSchema } from "../resource";

//------------------------------------------------------------------------------
// Spell
//------------------------------------------------------------------------------

export const spellSchema = resourceSchema.extend({
  level: spellLevelSchema,

  character_classes: z.array(characterClassSchema),
  school: spellSchoolSchema,

  casting_time: spellCastingTimeSchema,
  casting_time_value_temp: z.number().nullish(),

  duration: spellDurationSchema,
  duration_value: timeSchema.nullish(),

  range: spellRangeSchema,
  range_value: z.number().nullish(),

  concentration: z.boolean(),
  ritual: z.boolean(),

  material: z.boolean(),
  somatic: z.boolean(),
  verbal: z.boolean(),

  materials: i18nStringSchema.nullish(),

  description: i18nStringSchema,
  upgrade: i18nStringSchema.nullish(),
});

export type Spell = z.infer<typeof spellSchema>;

//------------------------------------------------------------------------------
// Spell Filters
//------------------------------------------------------------------------------

export const spellFiltersSchema = resourceFiltersSchema.extend({
  character_classes: z
    .partialRecord(characterClassSchema, z.boolean().optional())
    .optional(),
  levels: z
    .partialRecord(spellLevelStringSchema, z.boolean().optional())
    .optional(),
  schools: z
    .partialRecord(spellSchoolSchema, z.boolean().optional())
    .optional(),

  concentration: z.boolean().optional(),
  ritual: z.boolean().optional(),

  material: z.boolean().optional(),
  somatic: z.boolean().optional(),
  verbal: z.boolean().optional(),
});

export type SpellFilters = z.infer<typeof spellFiltersSchema>;

//------------------------------------------------------------------------------
// Default Spell
//------------------------------------------------------------------------------

export const defaultSpell: Spell = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  name: {},
  page: {},

  level: 0,

  character_classes: [],
  school: "abjuration",

  casting_time: "action",
  casting_time_value_temp: undefined,

  duration: "instantaneous",
  duration_value: undefined,

  range: "self",
  range_value: undefined,

  concentration: false,
  ritual: false,

  material: false,
  somatic: false,
  verbal: false,

  materials: undefined,

  description: {},
  upgrade: {},

  visibility: "game_master",
};

//------------------------------------------------------------------------------
// Default Spell Filters
//------------------------------------------------------------------------------

export const defaultSpellFilters: SpellFilters = {
  order_by: "name",
  order_dir: "asc",
};
