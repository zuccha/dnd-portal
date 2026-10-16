import z from "zod";
import { createForm } from "~/utils/form";
import { spellCastingTimeSchema } from "../../types/spell-casting-time";
import { spellDurationSchema } from "../../types/spell-duration";
import { spellLevelSchema } from "../../types/spell-level";
import { spellRangeSchema } from "../../types/spell-range";
import { spellSchoolSchema } from "../../types/spell-school";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  createIdRelationEndpointUpdates,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { ResourceFormOutput } from "../resource-form";
import type { Spell } from "./spell";

//------------------------------------------------------------------------------
// Spell Form Data
//------------------------------------------------------------------------------

export const spellFormDataSchema = resourceFormDataSchema.extend({
  casting_time: spellCastingTimeSchema.default("action"),
  casting_time_value: z.number().default(0),
  character_class_ids: z.array(z.uuid()),
  description: z.string().default(""),
  duration: spellDurationSchema.default("instantaneous"),
  duration_value: z.number().default(0),
  has_concentration: z.boolean().default(false),
  has_ritual: z.boolean().default(false),
  is_material: z.boolean().default(false),
  is_somatic: z.boolean().default(false),
  is_verbal: z.boolean().default(false),
  level: spellLevelSchema.default(0),
  materials: z.string().default(""),
  range: spellRangeSchema.default("self"),
  range_value: z.number().default(0),
  school: spellSchoolSchema.default("abjuration"),
  upgrade: z.string().default(""),
});

export type SpellFormData = z.infer<typeof spellFormDataSchema>;

//------------------------------------------------------------------------------
// Spell Form Data To Resource
//------------------------------------------------------------------------------

export function spellFormDataToResource(
  data: Partial<SpellFormData>,
  lang: string,
): ResourceFormOutput<Spell> {
  const { character_class_ids, ...resourceData } = data;
  const resource = createResourceFormDataPatch({
    ...resourceFormDataToResource(resourceData, lang),
    casting_time: data.casting_time,
    casting_time_value: data.casting_time_value,
    description: createResourceFormDataI18nValue(data.description, lang),
    duration: data.duration,
    duration_value: data.duration_value,
    has_concentration: data.has_concentration,
    has_ritual: data.has_ritual,
    is_material: data.is_material,
    is_somatic: data.is_somatic,
    is_verbal: data.is_verbal,
    level: data.level,
    materials: createResourceFormDataI18nValue(data.materials, lang),
    range: data.range,
    range_value: data.range_value,
    school: data.school,
    upgrade: createResourceFormDataI18nValue(data.upgrade, lang),
  });
  const relations = createIdRelationEndpointUpdates(
    "character_classes_and_spells",
    character_class_ids,
  );
  return { resource, relations };
}

//------------------------------------------------------------------------------
// Spell Form
//------------------------------------------------------------------------------

export const spellForm = createForm("spell", spellFormDataSchema.parse);
