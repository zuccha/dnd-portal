import z from "zod";
import { featureEntrySchema } from "../features/feature-entry";
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
  feature_entries: z.array(featureEntrySchema),
  kind: z.literal("character_subclass"),
});

export type CharacterSubclass = z.infer<typeof characterSubclassSchema>;

//------------------------------------------------------------------------------
// Default Character Subclass
//------------------------------------------------------------------------------

export const defaultCharacterSubclass: CharacterSubclass = {
  ...defaultResource,
  character_class_id: "",
  feature_entries: [],
  kind: "character_subclass",
};

//------------------------------------------------------------------------------
// Character Subclass Translation Fields
//------------------------------------------------------------------------------

export const characterSubclassTranslationFields: TranslationFields<CharacterSubclass>[] = [
  ...resourceTranslationFields,
];
