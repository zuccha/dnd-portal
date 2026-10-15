import z from "zod";
import { createForm } from "~/utils/form";
import { creatureTreasureSchema } from "../../types/creature-treasure";
import {
  createIdRelationEndpointUpdates,
  createResourceFormDataPatch,
  type ResourceFormOutput,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { CreatureFamily } from "./creature-family";

//------------------------------------------------------------------------------
// Creature Family Form Data
//------------------------------------------------------------------------------

export const creatureFamilyFormDataSchema = resourceFormDataSchema.extend({
  habitat_ids: z.array(z.uuid()).default([]),
  plane_ids: z.array(z.uuid()).default([]),
  treasures: z.array(creatureTreasureSchema).default([]),
});

export type CreatureFamilyFormData = z.infer<typeof creatureFamilyFormDataSchema>;

//------------------------------------------------------------------------------
// Creature Family Form Data To Resource
//------------------------------------------------------------------------------

export function creatureFamilyFormDataToResource(
  data: Partial<CreatureFamilyFormData>,
  lang: string,
): ResourceFormOutput<CreatureFamily> {
  const { habitat_ids, ...resourceData } = data;
  const resource = createResourceFormDataPatch({
    ...resourceFormDataToResource(resourceData, lang),
    plane_ids: data.plane_ids,
    treasures: data.treasures,
  });
  const relations = createIdRelationEndpointUpdates(
    "creature_families_and_creature_habitats",
    habitat_ids,
  );

  return { resource, relations };
}

//------------------------------------------------------------------------------
// Creature Family Form
//------------------------------------------------------------------------------

export const creatureFamilyForm = createForm("creature_family", creatureFamilyFormDataSchema.parse);
