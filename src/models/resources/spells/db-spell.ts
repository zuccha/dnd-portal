import z from "zod";
import { characterClassSchema } from "../../types/character-class";
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
  level: spellLevelSchema,

  character_classes: z.array(characterClassSchema),
  school: spellSchoolSchema,

  casting_time: spellCastingTimeSchema,
  casting_time_value_temp: z.number().nullish(),

  duration: spellDurationSchema,
  duration_value_temp: z.number().nullish(),

  range: spellRangeSchema,
  range_value: z.number().nullish(),

  concentration: z.boolean(),
  ritual: z.boolean(),

  material: z.boolean(),
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
