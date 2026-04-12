import z from "zod";
import { createForm } from "~/utils/form";
import { spellCastingTimeSchema } from "../../types/spell-casting-time";
import { spellDurationSchema } from "../../types/spell-duration";
import { spellLevelSchema } from "../../types/spell-level";
import { spellRangeSchema } from "../../types/spell-range";
import { spellSchoolSchema } from "../../types/spell-school";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import { type DBSpell, type DBSpellTranslation } from "./db-spell";

//------------------------------------------------------------------------------
// Spell Form Data
//------------------------------------------------------------------------------

export const spellFormDataSchema = resourceFormDataSchema.extend({
  casting_time: spellCastingTimeSchema.default("action"),
  casting_time_value: z.number().default(0),
  character_class_ids: z.array(z.uuid()),
  concentration: z.boolean().default(false),
  description: z.string().default(""),
  duration: spellDurationSchema.default("instantaneous"),
  duration_value: z.number().default(0),
  level: spellLevelSchema.default(0),
  material: z.boolean().default(false),
  materials: z.string().default(""),
  range: spellRangeSchema.default("self"),
  range_value: z.number().default(0),
  ritual: z.boolean().default(false),
  school: spellSchoolSchema.default("abjuration"),
  somatic: z.boolean().default(false),
  upgrade: z.string().default(""),
  verbal: z.boolean().default(false),
});

export type SpellFormData = z.infer<typeof spellFormDataSchema>;

//------------------------------------------------------------------------------
// Spell Form Data To DB
//------------------------------------------------------------------------------

export function spellFormDataToDB(data: Partial<SpellFormData>): {
  resource: Partial<DBSpell>;
  translation: Partial<DBSpellTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      casting_time: data.casting_time,
      casting_time_value: data.casting_time_value,
      character_class_ids: data.character_class_ids,
      concentration: data.concentration,
      duration: data.duration,
      duration_value: data.duration_value,
      level: data.level,
      material: data.material,
      range: data.range,
      range_value: data.range_value,
      ritual: data.ritual,
      school: data.school,
      somatic: data.somatic,
      verbal: data.verbal,
    },
    translation: {
      ...translation,
      description: data.description,
      materials: data.materials,
      upgrade: data.upgrade,
    },
  };
}

//------------------------------------------------------------------------------
// Spell Form
//------------------------------------------------------------------------------

export const spellForm = createForm("spell", spellFormDataSchema.parse);
