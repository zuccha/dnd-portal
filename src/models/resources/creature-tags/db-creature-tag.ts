import z from "zod";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Creature Tag
//------------------------------------------------------------------------------

export const dbCreatureTagSchema = dbResourceSchema.extend({});

export type DBCreatureTag = z.infer<typeof dbCreatureTagSchema>;

//------------------------------------------------------------------------------
// DB Creature Tag Translation
//------------------------------------------------------------------------------

export const dbCreatureTagTranslationSchema =
  dbResourceTranslationSchema.extend({});

export type DBCreatureTagTranslation = z.infer<
  typeof dbCreatureTagTranslationSchema
>;
