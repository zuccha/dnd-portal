import z from "zod";
import { createForm } from "~/utils/form";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureSkillSchema } from "../../types/creature-skill";
import {
  startingEquipmentGroupSchema,
  startingEquipmentToEntries,
} from "../character-classes/starting-equipment";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import {
  type DBBackground,
  type DBBackgroundTranslation,
} from "./db-background";

//------------------------------------------------------------------------------
// Background Form Data
//------------------------------------------------------------------------------

export const backgroundFormDataSchema = resourceFormDataSchema.extend({
  ability_scores: z.array(creatureAbilitySchema).default([]),
  feat_id: z.uuid().nullable().default(null),
  name: z.string().default(""),
  page: z.number().default(0),
  skill_proficiencies: z.array(creatureSkillSchema).default([]),
  starting_equipment: z.array(startingEquipmentGroupSchema).default([]),
  tool_proficiency_id: z.uuid().nullable().default(null),
});

export type BackgroundFormData = z.infer<typeof backgroundFormDataSchema>;

//------------------------------------------------------------------------------
// Background Form Data To DB
//------------------------------------------------------------------------------

export function backgroundFormDataToDB(data: Partial<BackgroundFormData>): {
  resource: Partial<DBBackground>;
  translation: Partial<DBBackgroundTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      ability_scores: data.ability_scores,
      feat_id: data.feat_id,
      skill_proficiencies: data.skill_proficiencies,
      starting_equipment_entries:
        data.starting_equipment ?
          startingEquipmentToEntries(data.starting_equipment)
        : undefined,
      tool_proficiency_id: data.tool_proficiency_id,
    },
    translation,
  };
}

//------------------------------------------------------------------------------
// Background Form
//------------------------------------------------------------------------------

export const backgroundForm = createForm(
  "background",
  backgroundFormDataSchema.parse,
);

