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
  casting_time: spellCastingTimeSchema,
  casting_time_value: z.number(),
  character_class_ids: z.array(z.uuid()),
  concentration: z.boolean(),
  description: z.string(),
  duration: spellDurationSchema,
  duration_value: z.number(),
  level: spellLevelSchema,
  material: z.boolean(),
  materials: z.string(),
  range: spellRangeSchema,
  range_value: z.number(),
  ritual: z.boolean(),
  school: spellSchoolSchema,
  somatic: z.boolean(),
  upgrade: z.string(),
  verbal: z.boolean(),
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
