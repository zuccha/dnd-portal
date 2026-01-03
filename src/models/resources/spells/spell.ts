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
  casting_time: spellCastingTimeSchema,
  casting_time_value: z.number().nullish(),
  character_classes: z.array(characterClassSchema),
  concentration: z.boolean(),
  description: i18nStringSchema,
  duration: spellDurationSchema,
  duration_value: z.number().nullish(),
  level: spellLevelSchema,
  material: z.boolean(),
  materials: i18nStringSchema.nullish(),
  range: spellRangeSchema,
  range_value: z.number().nullish(),
  ritual: z.boolean(),
  school: spellSchoolSchema,
  somatic: z.boolean(),
  upgrade: i18nStringSchema.nullish(),
  verbal: z.boolean(),
});

export type Spell = z.infer<typeof spellSchema>;

//------------------------------------------------------------------------------
// Default Spell
//------------------------------------------------------------------------------

export const defaultSpell: Spell = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  visibility: "game_master",

  name: {},
  page: {},

  casting_time: "action",
  casting_time_value: undefined,
  character_classes: [],
  concentration: false,
  description: {},
  duration: "instantaneous",
  duration_value: undefined,
  level: 0,
  material: false,
  materials: undefined,
  range: "self",
  range_value: undefined,
  ritual: false,
  school: "abjuration",
  somatic: false,
  upgrade: {},
  verbal: false,
};

//------------------------------------------------------------------------------
// Spell Translation Fields
//------------------------------------------------------------------------------

export const spellTranslationFields: KeysOfType<
  Spell,
  I18nNumber | I18nString
>[] = [...resourceTranslationFields, "description"];
