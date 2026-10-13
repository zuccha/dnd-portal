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
  kind: z.literal("character_subclass"),
});

export type CharacterSubclass = z.infer<typeof characterSubclassSchema>;

//------------------------------------------------------------------------------
// Default Character Subclass
//------------------------------------------------------------------------------

export const defaultCharacterSubclass: CharacterSubclass = {
  ...defaultResource,
  character_class_id: "",
  kind: "character_subclass",
};

//------------------------------------------------------------------------------
// Character Subclass Translation Fields
//------------------------------------------------------------------------------

export const characterSubclassTranslationFields: TranslationFields<CharacterSubclass>[] = [
  ...resourceTranslationFields,
];
