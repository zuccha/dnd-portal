import z from "zod";
import { createForm } from "~/utils/form";
import { characterLevelSchema } from "../../types/character-level";
import { featCategorySchema } from "../../types/feat-category";
import { featureEntrySchema } from "../features/feature-entry";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
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

export function featFormDataToResource(data: Partial<FeatFormData>, lang: string): Partial<Feat> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    category: data.category,
    description: createResourceFormDataI18nValue(data.description, lang),
    feature_entries: data.feature_entries,
    min_level: data.min_level,
    prerequisite: createResourceFormDataI18nValue(data.prerequisite, lang),
  });
}

//------------------------------------------------------------------------------
// Feat Form
//------------------------------------------------------------------------------

export const featForm = createForm("feat", featFormDataSchema.parse);
