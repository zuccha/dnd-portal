import z from "zod";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Maneuver
//------------------------------------------------------------------------------

export const dbManeuverSchema = dbResourceSchema;

export type DBManeuver = z.infer<typeof dbManeuverSchema>;

//------------------------------------------------------------------------------
// DB Maneuver Translation
//------------------------------------------------------------------------------

export const dbManeuverTranslationSchema = dbResourceTranslationSchema.extend({
  description: z.string(),
  prerequisite: z.string().nullish(),
});

export type DBManeuverTranslation = z.infer<typeof dbManeuverTranslationSchema>;
