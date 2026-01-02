import { z } from "zod";
import type { I18nNumber } from "~/i18n/i18n-number";
import { type I18nString, i18nStringSchema } from "~/i18n/i18n-string";
import type { KeysOfType } from "~/types";
import { characterClassSchema } from "../../types/character-class";
import { spellCastingTimeSchema } from "../../types/spell-casting-time";
import { spellDurationSchema } from "../../types/spell-duration";
import { spellLevelSchema } from "../../types/spell-level";
import { spellRangeSchema } from "../../types/spell-range";
import { spellSchoolSchema } from "../../types/spell-school";
import { resourceSchema, resourceTranslationFields } from "../resource";

//------------------------------------------------------------------------------
// Spell
//------------------------------------------------------------------------------

export const spellSchema = resourceSchema.extend({
  level: spellLevelSchema,

  character_classes: z.array(characterClassSchema),
  school: spellSchoolSchema,

  casting_time: spellCastingTimeSchema,
  casting_time_value: z.number().nullish(),

  duration: spellDurationSchema,
  duration_value: z.number().nullish(),

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
  casting_time_value: undefined,

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
// Spell Translation Fields
//------------------------------------------------------------------------------

export const spellTranslationFields: KeysOfType<
  Spell,
  I18nNumber | I18nString
>[] = [...resourceTranslationFields, "description"];
