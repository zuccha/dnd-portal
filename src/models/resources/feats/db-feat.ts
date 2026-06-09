import z from "zod";
import { characterLevelSchema } from "../../types/character-level";
import { featCategorySchema } from "../../types/feat-category";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";
import { dbFeatureEntrySchema } from "../features/db-feature";

//------------------------------------------------------------------------------
// DB Feat
//------------------------------------------------------------------------------

export const dbFeatSchema = dbResourceSchema.extend({
  category: featCategorySchema,
  feature_entries: z.array(dbFeatureEntrySchema),
  min_level: characterLevelSchema,
});

export type DBFeat = z.infer<typeof dbFeatSchema>;

//------------------------------------------------------------------------------
// DB Feat Translation
//------------------------------------------------------------------------------

export const dbFeatTranslationSchema = dbResourceTranslationSchema.extend({
  description: z.string(),
  prerequisite: z.string(),
});

export type DBFeatTranslation = z.infer<typeof dbFeatTranslationSchema>;
