import z from "zod";
import { createForm } from "~/utils/form";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import { dbFeatureGrantSchema } from "./db-feature";
import type { DBFeature, DBFeatureTranslation } from "./db-feature";

//------------------------------------------------------------------------------
// Feature Form Data
//------------------------------------------------------------------------------

export const featureFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  display_name: z.string().default(""),
  granted_by: z.array(dbFeatureGrantSchema).default([]),
});

export type FeatureFormData = z.infer<typeof featureFormDataSchema>;

//------------------------------------------------------------------------------
// Feature Form Data To DB
//------------------------------------------------------------------------------

export function featureFormDataToDB(data: Partial<FeatureFormData>): {
  resource: Partial<DBFeature>;
  translation: Partial<DBFeatureTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      granted_by: data.granted_by,
    },
    translation: {
      ...translation,
      description: data.description,
      display_name: data.display_name,
    },
  };
}

//------------------------------------------------------------------------------
// Feature Form
//------------------------------------------------------------------------------

export const featureForm = createForm("feature", featureFormDataSchema.parse);
