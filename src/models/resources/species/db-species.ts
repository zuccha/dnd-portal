import z from "zod";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureTypeSchema } from "../../types/creature-type";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";
import { dbFeatureEntrySchema } from "../features/db-feature";

//------------------------------------------------------------------------------
// DB Species
//------------------------------------------------------------------------------

export const dbSpeciesSchema = dbResourceSchema.extend({
  feature_entries: z.array(dbFeatureEntrySchema),
  sizes: z.array(creatureSizeSchema).min(1),
  speed: z.number(),
  type: creatureTypeSchema,
});

export type DBSpecies = z.infer<typeof dbSpeciesSchema>;

//------------------------------------------------------------------------------
// DB Species Translation
//------------------------------------------------------------------------------

export const dbSpeciesTranslationSchema = dbResourceTranslationSchema.extend({
  description: z.string(),
});

export type DBSpeciesTranslation = z.infer<typeof dbSpeciesTranslationSchema>;
