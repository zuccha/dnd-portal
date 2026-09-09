import z from "zod";
import { createForm } from "~/utils/form";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureTypeSchema } from "../../types/creature-type";
import { featureEntrySchema } from "../features/feature-entry";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Species } from "./species";

//------------------------------------------------------------------------------
// Species Form Data
//------------------------------------------------------------------------------

export const speciesFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  feature_entries: z.array(featureEntrySchema).default([]),
  sizes: z.array(creatureSizeSchema).min(1).default(["medium"]),
  speed: z.number().default(30),
  type: creatureTypeSchema.default("humanoid"),
});

export type SpeciesFormData = z.infer<typeof speciesFormDataSchema>;

//------------------------------------------------------------------------------
// Species Form Data To Resource
//------------------------------------------------------------------------------

export function speciesFormDataToResource(
  data: Partial<SpeciesFormData>,
  lang: string,
): Partial<Species> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    description: createResourceFormDataI18nValue(data.description, lang),
    feature_entries: data.feature_entries,
    sizes: data.sizes,
    speed: data.speed,
    type: data.type,
  });
}

//------------------------------------------------------------------------------
// Species Form
//------------------------------------------------------------------------------

export const speciesForm = createForm("species", speciesFormDataSchema.parse);
