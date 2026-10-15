import z from "zod";
import { createForm } from "~/utils/form";
import { characterLevelSchema } from "../../types/character-level";
import { featCategorySchema } from "../../types/feat-category";
import { featureEntrySchema } from "../features/feature-entry";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  createRelationEndpointUpdates,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { ResourceFormOutput } from "../resource-form";
import type { Feat } from "./feat";

//------------------------------------------------------------------------------
// Feat Form Data
//------------------------------------------------------------------------------

export const featFormDataSchema = resourceFormDataSchema.extend({
  category: featCategorySchema.default("general"),
  description: z.string().default(""),
  feature_entries: z.array(featureEntrySchema).default([]),
  min_level: characterLevelSchema.default(0),
  prerequisite: z.string().default(""),
});

export type FeatFormData = z.infer<typeof featFormDataSchema>;

//------------------------------------------------------------------------------
// Feat Form Data To Resource
//------------------------------------------------------------------------------

export function featFormDataToResource(
  data: Partial<FeatFormData>,
  lang: string,
): ResourceFormOutput<Feat> {
  const { feature_entries, ...resourceData } = data;
  const resource = createResourceFormDataPatch({
    ...resourceFormDataToResource(resourceData, lang),
    category: data.category,
    description: createResourceFormDataI18nValue(data.description, lang),
    min_level: data.min_level,
    prerequisite: createResourceFormDataI18nValue(data.prerequisite, lang),
  });
  const relations = createRelationEndpointUpdates("feats_and_features", feature_entries);
  return { resource, relations };
}

//------------------------------------------------------------------------------
// Feat Form
//------------------------------------------------------------------------------

export const featForm = createForm("feat", featFormDataSchema.parse);
