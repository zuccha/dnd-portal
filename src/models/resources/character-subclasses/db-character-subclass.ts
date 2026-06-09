import z from "zod";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";
import { dbFeatureEntrySchema } from "../features/db-feature";

//------------------------------------------------------------------------------
// DB Character Subclass
//------------------------------------------------------------------------------

export const dbCharacterSubclassSchema = dbResourceSchema.extend({
  character_class_id: z.uuid(),
  feature_entries: z.array(dbFeatureEntrySchema),
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
