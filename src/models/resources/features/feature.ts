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
  display_name: i18nStringSchema,
  granted_by: z.array(dbFeatureGrantSchema),
  kind: z.literal("feature"),
});

export type Feature = z.infer<typeof featureSchema>;

//------------------------------------------------------------------------------
// Default Feature
//------------------------------------------------------------------------------

export const defaultFeature: Feature = {
  ...defaultResource,
  description: {},
  display_name: {},
  granted_by: [],
  kind: "feature",
};

//------------------------------------------------------------------------------
// Feature Translation Fields
//------------------------------------------------------------------------------

export const featureTranslationFields: TranslationFields<Feature>[] = [
  ...resourceTranslationFields,
  "description",
  "display_name",
];
