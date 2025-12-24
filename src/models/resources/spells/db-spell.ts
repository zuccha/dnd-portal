import z from "zod";
import { timeSchema } from "~/i18n/i18n-time";
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
  casting_time_value: timeSchema.nullish(),

  duration: spellDurationSchema,
  duration_value: timeSchema.nullish(),

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
  spell_id: z.uuid(),

  description: z.string(),
  materials: z.string().nullish(),
  upgrade: z.string().nullish(),
});

export type DBSpellTranslation = z.infer<typeof dbSpellTranslationSchema>;
