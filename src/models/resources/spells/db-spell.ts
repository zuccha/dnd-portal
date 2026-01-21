import z from "zod";
import { spellCastingTimeSchema } from "../../types/spell-casting-time";
import { spellDurationSchema } from "../../types/spell-duration";
import { spellLevelSchema } from "../../types/spell-level";
import { spellRangeSchema } from "../../types/spell-range";
import { spellSchoolSchema } from "../../types/spell-school";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Spell
//------------------------------------------------------------------------------

export const dbSpellSchema = dbResourceSchema.extend({
  casting_time: spellCastingTimeSchema,
  casting_time_value: z.number().nullish(),
  character_class_ids: z.array(z.uuid()),
  concentration: z.boolean(),
  duration: spellDurationSchema,
  duration_value: z.number().nullish(),
  level: spellLevelSchema,
  material: z.boolean(),
  range: spellRangeSchema,
  range_value: z.number().nullish(),
  ritual: z.boolean(),
  school: spellSchoolSchema,
  somatic: z.boolean(),
  verbal: z.boolean(),
});

export type DBSpell = z.infer<typeof dbSpellSchema>;

//------------------------------------------------------------------------------
// DB Spell Translation
//------------------------------------------------------------------------------

export const dbSpellTranslationSchema = dbResourceTranslationSchema.extend({
  description: z.string(),
  materials: z.string().nullish(),
  upgrade: z.string().nullish(),
});

export type DBSpellTranslation = z.infer<typeof dbSpellTranslationSchema>;
