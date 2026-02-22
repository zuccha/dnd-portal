import z from "zod";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Character Subclass
//------------------------------------------------------------------------------

export const dbCharacterSubclassSchema = dbResourceSchema.extend({
  character_class_id: z.uuid(),
});

export type DBCharacterSubclass = z.infer<typeof dbCharacterSubclassSchema>;

//------------------------------------------------------------------------------
// DB Character Subclass Translation
//------------------------------------------------------------------------------

export const dbCharacterSubclassTranslationSchema =
  dbResourceTranslationSchema.extend({});

export type DBCharacterSubclassTranslation = z.infer<
  typeof dbCharacterSubclassTranslationSchema
>;
