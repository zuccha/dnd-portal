import z from "zod";
import { createForm } from "~/utils/form";
import {
  createIdRelationEndpointUpdates,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { ResourceFormOutput } from "../resource-form";
import type { CreatureTreasure } from "./creature-treasure";

//------------------------------------------------------------------------------
// Creature Treasure Form Data Schema
//------------------------------------------------------------------------------

export const creatureTreasureFormDataSchema = resourceFormDataSchema.extend({
  family_ids: z.array(z.uuid()).default([]),
});

//------------------------------------------------------------------------------
// Creature Treasure Form Data
//------------------------------------------------------------------------------

export type CreatureTreasureFormData = z.infer<typeof creatureTreasureFormDataSchema>;

//------------------------------------------------------------------------------
// Creature Treasure Form Data To Resource
//------------------------------------------------------------------------------

export function creatureTreasureFormDataToResource(
  data: Partial<CreatureTreasureFormData>,
  lang: string,
): ResourceFormOutput<CreatureTreasure> {
  const { family_ids, ...resourceData } = data;
  const resource = resourceFormDataToResource(resourceData, lang);
  const relations = createIdRelationEndpointUpdates(
    "creature_families_and_creature_treasures",
    family_ids,
  );

  return { resource, relations };
}

//------------------------------------------------------------------------------
// Creature Treasure Form
//------------------------------------------------------------------------------

export const creatureTreasureForm = createForm(
  "creature_treasure",
  creatureTreasureFormDataSchema.parse,
);
