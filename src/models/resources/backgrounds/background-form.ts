import z from "zod";
import { createForm } from "~/utils/form";
import { equipmentBundleSchema } from "../../other/equipment-bundle";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureSkillSchema } from "../../types/creature-skill";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Background } from "./background";

//------------------------------------------------------------------------------
// Background Form Data
//------------------------------------------------------------------------------

export const backgroundFormDataSchema = resourceFormDataSchema.extend({
  ability_scores: z.array(creatureAbilitySchema).default([]),
  feat_id: z.uuid().nullable().default(null),
  feat_notes: z.string().default(""),
  name: z.string().default(""),
  page: z.number().default(0),
  skill_proficiencies: z.array(creatureSkillSchema).default([]),
  starting_equipment: z.array(z.array(equipmentBundleSchema)).default([]),
  tool_notes: z.string().default(""),
  tool_proficiency_id: z.uuid().nullable().default(null),
});

export type BackgroundFormData = z.infer<typeof backgroundFormDataSchema>;

//------------------------------------------------------------------------------
// Background Form Data To Resource
//------------------------------------------------------------------------------

export function backgroundFormDataToResource(
  data: Partial<BackgroundFormData>,
  lang: string,
): Partial<Background> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    ability_scores: data.ability_scores,
    feat_id: data.feat_id,
    feat_notes: createResourceFormDataI18nValue(data.feat_notes, lang),
    skill_proficiencies: data.skill_proficiencies,
    starting_equipment: data.starting_equipment,
    tool_notes: createResourceFormDataI18nValue(data.tool_notes, lang),
    tool_proficiency_id: data.tool_proficiency_id,
  });
}

//------------------------------------------------------------------------------
// Background Form
//------------------------------------------------------------------------------

export const backgroundForm = createForm("background", backgroundFormDataSchema.parse);
