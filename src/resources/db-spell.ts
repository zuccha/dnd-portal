import z from "zod";
import { distanceImpSchema, distanceMetSchema } from "../i18n/i18n-distance";
import { i18nStringSchema } from "../i18n/i18n-string";
import { timeSchema } from "../i18n/i18n-time";
import { campaignRoleSchema } from "./campaign-role";
import { characterClassSchema } from "./character-class";
import { spellCastingTimeSchema } from "./spell-casting-time";
import { spellDurationSchema } from "./spell-duration";
import { spellLevelSchema } from "./spell-level";
import { spellRangeSchema } from "./spell-range";
import { spellSchoolSchema } from "./spell-school";

//------------------------------------------------------------------------------
// DBSpell
//------------------------------------------------------------------------------

export const dbSpellSchema = z.object({
  id: z.uuid(),

  campaign_id: z.string(),

  name: i18nStringSchema,
  page: i18nStringSchema.nullish(),

  level: spellLevelSchema,

  character_classes: z.array(characterClassSchema),
  school: spellSchoolSchema,

  casting_time: spellCastingTimeSchema,
  casting_time_value: timeSchema.nullish(),

  duration: spellDurationSchema,
  duration_value: timeSchema.nullish(),

  range: spellRangeSchema,
  range_value_imp: distanceImpSchema.nullish(),
  range_value_met: distanceMetSchema.nullish(),

  concentration: z.boolean(),
  ritual: z.boolean(),

  material: z.boolean(),
  somatic: z.boolean(),
  verbal: z.boolean(),

  visibility: campaignRoleSchema,
});

export type DBSpell = z.infer<typeof dbSpellSchema>;

//------------------------------------------------------------------------------
// DB Spell Translation
//------------------------------------------------------------------------------

export const dbSpellTranslationSchema = z.object({
  lang: z.string(),
  spell_id: z.uuid(),

  description: z.string(),
  materials: z.string().nullish(),
  name: z.string(),
  page: z.string().nullish(),
  upgrade: z.string().nullish(),
});

export type DBSpellTranslation = z.infer<typeof dbSpellTranslationSchema>;
