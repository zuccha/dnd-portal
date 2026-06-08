import z from "zod";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureTypeSchema } from "../../types/creature-type";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Species
//------------------------------------------------------------------------------

export const dbSpeciesSchema = dbResourceSchema.extend({
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
