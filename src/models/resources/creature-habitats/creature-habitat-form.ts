import z from "zod";
import { createForm } from "~/utils/form";
import {
  resourceFormDataSchema,
  resourceFormDataToResource,
  type ResourceFormOutput,
} from "../resource-form";
import type { RelationEndpointUpdate } from "../../catalogue/resource-relations";
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
  const relations: RelationEndpointUpdate[] =
    family_ids === undefined
      ? []
      : [
          {
            group: "creature_families_and_creature_habitats",
            related: family_ids.map((id) => ({ id })),
          },
        ];

  return { resource, relations };
}

//------------------------------------------------------------------------------
// Creature Habitat Form
//------------------------------------------------------------------------------

export const creatureHabitatForm = createForm(
  "creature_habitat",
  creatureHabitatFormDataSchema.parse,
);
