import { z } from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { spellCastingTimeSchema } from "../../types/spell-casting-time";
import { spellDurationSchema } from "../../types/spell-duration";
import { spellLevelSchema } from "../../types/spell-level";
import { spellRangeSchema } from "../../types/spell-range";
import { spellSchoolSchema } from "../../types/spell-school";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Spell
//------------------------------------------------------------------------------

export const spellSchema = resourceSchema.extend({
  casting_time: spellCastingTimeSchema,
  casting_time_value: z.number().nullish(),
  character_class_ids: z.array(z.uuid()),
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
  ...defaultResource,
  casting_time: "action",
  casting_time_value: undefined,
  character_class_ids: [],
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

export const spellTranslationFields: TranslationFields<Spell>[] = [
  ...resourceTranslationFields,
  "description",
];
