import z from "zod";
import { createForm } from "~/utils/form";
import { creatureHabitatSchema } from "../../types/creature-habitat";
import { creatureTreasureSchema } from "../../types/creature-treasure";
import { resourceFormDataSchema, resourceFormDataToResource } from "../resource-form";
import type { CreatureFamily } from "./creature-family";

//------------------------------------------------------------------------------
// Creature Family Form Data
//------------------------------------------------------------------------------

export const creatureFamilyFormDataSchema = resourceFormDataSchema.extend({
  habitats: z.array(creatureHabitatSchema).default([]),
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
): Partial<CreatureFamily> {
  return {
    ...resourceFormDataToResource(data, lang),
    habitats: data.habitats ?? [],
    plane_ids: data.plane_ids ?? [],
    treasures: data.treasures ?? [],
  };
}

//------------------------------------------------------------------------------
// Creature Family Form
//------------------------------------------------------------------------------

export const creatureFamilyForm = createForm("creature_family", creatureFamilyFormDataSchema.parse);
