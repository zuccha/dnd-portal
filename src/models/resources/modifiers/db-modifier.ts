import z from "zod";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Modifier
//------------------------------------------------------------------------------

export const dbModifierSchema = dbResourceSchema;

export type DBModifier = z.infer<typeof dbModifierSchema>;

//------------------------------------------------------------------------------
// DB Modifier Translation
//------------------------------------------------------------------------------

export const dbModifierTranslationSchema = dbResourceTranslationSchema.extend({
  applies_to: z.string().nullish(),
  composite_name: z.string(),
});

export type DBModifierTranslation = z.infer<typeof dbModifierTranslationSchema>;
