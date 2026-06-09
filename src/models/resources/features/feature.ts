import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";
import { dbFeatureGrantSchema } from "./db-feature";

//------------------------------------------------------------------------------
// Feature
//------------------------------------------------------------------------------

export const featureSchema = resourceSchema.extend({
  description: i18nStringSchema,
  granted_by: z.array(dbFeatureGrantSchema),
});

export type Feature = z.infer<typeof featureSchema>;

//------------------------------------------------------------------------------
// Default Feature
//------------------------------------------------------------------------------

export const defaultFeature: Feature = {
  ...defaultResource,
  description: {},
  granted_by: [],
};

//------------------------------------------------------------------------------
// Feature Translation Fields
//------------------------------------------------------------------------------

export const featureTranslationFields: TranslationFields<Feature>[] = [
  ...resourceTranslationFields,
  "description",
];
