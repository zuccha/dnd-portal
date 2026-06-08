import z from "zod";
import { createForm } from "~/utils/form";
import { characterLevelSchema } from "../../types/character-level";
import { featCategorySchema } from "../../types/feat-category";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import type { DBFeat, DBFeatTranslation } from "./db-feat";

//------------------------------------------------------------------------------
// Feat Form Data
//------------------------------------------------------------------------------

export const featFormDataSchema = resourceFormDataSchema.extend({
  category: featCategorySchema.default("general"),
  description: z.string().default(""),
  min_level: characterLevelSchema.default(0),
  prerequisite: z.string().default(""),
});

export type FeatFormData = z.infer<typeof featFormDataSchema>;

//------------------------------------------------------------------------------
// Feat Form Data To DB
//------------------------------------------------------------------------------

export function featFormDataToDB(data: Partial<FeatFormData>): {
  resource: Partial<DBFeat>;
  translation: Partial<DBFeatTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      category: data.category,
      min_level: data.min_level,
    },
    translation: {
      ...translation,
      description: data.description,
      prerequisite: data.prerequisite,
    },
  };
}

//------------------------------------------------------------------------------
// Feat Form
//------------------------------------------------------------------------------

export const featForm = createForm("feat", featFormDataSchema.parse);
