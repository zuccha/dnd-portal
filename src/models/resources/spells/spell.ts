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
  description: i18nStringSchema,
  duration: spellDurationSchema,
  duration_value: z.number().nullish(),
  has_concentration: z.boolean(),
  has_ritual: z.boolean(),
  is_material: z.boolean(),
  is_somatic: z.boolean(),
  is_verbal: z.boolean(),
  kind: z.literal("spell"),
  level: spellLevelSchema,
  materials: i18nStringSchema.nullish(),
  range: spellRangeSchema,
  range_value: z.number().nullish(),
  school: spellSchoolSchema,
  upgrade: i18nStringSchema.nullish(),
});

export type Spell = z.infer<typeof spellSchema>;

//------------------------------------------------------------------------------
// Default Spell
//------------------------------------------------------------------------------

export const defaultSpell: Spell = {
  ...defaultResource,
  casting_time: "action",
  casting_time_value: undefined,
  description: {},
  duration: "instantaneous",
  duration_value: undefined,
  has_concentration: false,
  has_ritual: false,
  is_material: false,
  is_somatic: false,
  is_verbal: false,
  kind: "spell",
  level: 0,
  materials: undefined,
  range: "self",
  range_value: undefined,
  school: "abjuration",
  upgrade: {},
};

//------------------------------------------------------------------------------
// Spell Translation Fields
//------------------------------------------------------------------------------

export const spellTranslationFields: TranslationFields<Spell>[] = [
  ...resourceTranslationFields,
  "description",
  "materials",
  "upgrade",
];
