import z from "zod";
import { createForm } from "~/utils/form";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import { featureGrantSchema } from "./feature-entry";
import type { Feature } from "./feature";

//------------------------------------------------------------------------------
// Feature Form Data
//------------------------------------------------------------------------------

export const featureFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  display_name: z.string().default(""),
  granted_by: z.array(featureGrantSchema).default([]),
});

export type FeatureFormData = z.infer<typeof featureFormDataSchema>;

//------------------------------------------------------------------------------
// Feature Form Data To Resource
//------------------------------------------------------------------------------

export function featureFormDataToResource(
  data: Partial<FeatureFormData>,
  lang: string,
): Partial<Feature> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    description: createResourceFormDataI18nValue(data.description, lang),
    display_name: createResourceFormDataI18nValue(data.display_name, lang),
    granted_by: data.granted_by,
  });
}

//------------------------------------------------------------------------------
// Feature Form
//------------------------------------------------------------------------------

export const featureForm = createForm("feature", featureFormDataSchema.parse);
