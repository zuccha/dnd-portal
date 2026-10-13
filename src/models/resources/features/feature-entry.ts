import z from "zod";
import { resourceFeatureKindSchema } from "../../types/resource-feature-kind";

//------------------------------------------------------------------------------
// Feature Grant
//------------------------------------------------------------------------------

export const featureGrantSchema = z.object({
  id: z.uuid(),
  kind: resourceFeatureKindSchema,
  min_level: z.number().min(0).max(20),
});

export type FeatureGrant = z.infer<typeof featureGrantSchema>;

//------------------------------------------------------------------------------
// Feature Entry
//------------------------------------------------------------------------------

export const featureEntrySchema = z.object({
  id: z.uuid(),
  min_level: z.number().min(0).max(20),
});

export type FeatureEntry = z.infer<typeof featureEntrySchema>;
