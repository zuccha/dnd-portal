import z from "zod";
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
});

export type CharacterSubclass = z.infer<typeof characterSubclassSchema>;

//------------------------------------------------------------------------------
// Default Character Subclass
//------------------------------------------------------------------------------

export const defaultCharacterSubclass: CharacterSubclass = {
  ...defaultResource,
  character_class_id: "",
};

//------------------------------------------------------------------------------
// Character Subclass Translation Fields
//------------------------------------------------------------------------------

export const characterSubclassTranslationFields: TranslationFields<CharacterSubclass>[] =
  [...resourceTranslationFields];
