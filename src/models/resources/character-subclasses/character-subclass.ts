import z from "zod";
import { dbFeatureEntrySchema } from "../features/db-feature";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Character Subclass
//------------------------------------------------------------------------------

export const characterSubclassSchema = resourceSchema.extend({
  character_class_id: z.uuid(),
  feature_entries: z.array(dbFeatureEntrySchema),
});

export type CharacterSubclass = z.infer<typeof characterSubclassSchema>;

//------------------------------------------------------------------------------
// Default Character Subclass
//------------------------------------------------------------------------------

export const defaultCharacterSubclass: CharacterSubclass = {
  ...defaultResource,
  character_class_id: "",
  feature_entries: [],
};

//------------------------------------------------------------------------------
// Character Subclass Translation Fields
//------------------------------------------------------------------------------

export const characterSubclassTranslationFields: TranslationFields<CharacterSubclass>[] =
  [...resourceTranslationFields];
