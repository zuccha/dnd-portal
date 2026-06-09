import z from "zod";
import { createForm } from "~/utils/form";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureTypeSchema } from "../../types/creature-type";
import { dbFeatureEntrySchema } from "../features/db-feature";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import type { DBSpecies, DBSpeciesTranslation } from "./db-species";

//------------------------------------------------------------------------------
// Species Form Data
//------------------------------------------------------------------------------

export const speciesFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  feature_entries: z.array(dbFeatureEntrySchema).default([]),
  sizes: z.array(creatureSizeSchema).min(1).default(["medium"]),
  speed: z.number().default(30),
  type: creatureTypeSchema.default("humanoid"),
});

export type SpeciesFormData = z.infer<typeof speciesFormDataSchema>;

//------------------------------------------------------------------------------
// Species Form Data To DB
//------------------------------------------------------------------------------

export function speciesFormDataToDB(data: Partial<SpeciesFormData>): {
  resource: Partial<DBSpecies>;
  translation: Partial<DBSpeciesTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      feature_entries: data.feature_entries,
      sizes: data.sizes,
      speed: data.speed,
      type: data.type,
    },
    translation: {
      ...translation,
      description: data.description,
    },
  };
}

//------------------------------------------------------------------------------
// Species Form
//------------------------------------------------------------------------------

export const speciesForm = createForm("species", speciesFormDataSchema.parse);
