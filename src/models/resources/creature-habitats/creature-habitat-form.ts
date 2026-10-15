import z from "zod";
import { createForm } from "~/utils/form";
import {
  createIdRelationEndpointUpdates,
  resourceFormDataSchema,
  resourceFormDataToResource,
  type ResourceFormOutput,
} from "../resource-form";
import type { CreatureHabitat } from "./creature-habitat";

//------------------------------------------------------------------------------
// Creature Habitat Form Data
//------------------------------------------------------------------------------

export const creatureHabitatFormDataSchema = resourceFormDataSchema.extend({
  family_ids: z.array(z.uuid()).default([]),
});

export type CreatureHabitatFormData = z.infer<typeof creatureHabitatFormDataSchema>;

//------------------------------------------------------------------------------
// Creature Habitat Form Data To Resource
//------------------------------------------------------------------------------

export function creatureHabitatFormDataToResource(
  data: Partial<CreatureHabitatFormData>,
  lang: string,
): ResourceFormOutput<CreatureHabitat> {
  const { family_ids, ...resourceData } = data;
  const resource = resourceFormDataToResource(resourceData, lang);
  const relations = createIdRelationEndpointUpdates(
    "creature_families_and_creature_habitats",
    family_ids,
  );

  return { resource, relations };
}

//------------------------------------------------------------------------------
// Creature Habitat Form
//------------------------------------------------------------------------------

export const creatureHabitatForm = createForm(
  "creature_habitat",
  creatureHabitatFormDataSchema.parse,
);
