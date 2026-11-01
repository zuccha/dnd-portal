import z from "zod";
import { createForm } from "~/utils/form";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureTypeSchema } from "../../types/creature-type";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { ResourceFormOutput } from "../resource-form";
import type { Species } from "./species";

//------------------------------------------------------------------------------
// Species Form Data
//------------------------------------------------------------------------------

export const speciesFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
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
): ResourceFormOutput<Species> {
  const resource = createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    description: createResourceFormDataI18nValue(data.description, lang),
    sizes: data.sizes,
    speed: data.speed,
    type: data.type,
  });
  return { resource, relations: [] };
}

//------------------------------------------------------------------------------
// Species Form
//------------------------------------------------------------------------------

export const speciesForm = createForm("species", speciesFormDataSchema.parse);
