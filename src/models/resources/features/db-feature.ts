import z from "zod";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Feature Grant
//------------------------------------------------------------------------------

export const dbFeatureGrantSchema = z.object({
  id: z.uuid(),
  min_level: z.number().min(0).max(20),
});

export type DBFeatureGrant = z.infer<typeof dbFeatureGrantSchema>;

//------------------------------------------------------------------------------
// DB Feature
//------------------------------------------------------------------------------

export const dbFeatureSchema = dbResourceSchema.extend({
  granted_by: z.array(dbFeatureGrantSchema),
});

export type DBFeature = z.infer<typeof dbFeatureSchema>;

//------------------------------------------------------------------------------
// DB Feature Translation
//------------------------------------------------------------------------------

export const dbFeatureTranslationSchema = dbResourceTranslationSchema.extend({
  description: z.string(),
});

export type DBFeatureTranslation = z.infer<typeof dbFeatureTranslationSchema>;
