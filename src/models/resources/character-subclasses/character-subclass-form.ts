import z from "zod";
import { createForm } from "~/utils/form";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import type {
  DBCharacterSubclass,
  DBCharacterSubclassTranslation,
} from "./db-character-subclass";

//------------------------------------------------------------------------------
// Character Subclass Form Data
//------------------------------------------------------------------------------

export const characterSubclassFormDataSchema = resourceFormDataSchema.extend({
  character_class_id: z.uuid(),
});

export type CharacterSubclassFormData = z.infer<
  typeof characterSubclassFormDataSchema
>;

//------------------------------------------------------------------------------
// Character Subclass Form Data To DB
//------------------------------------------------------------------------------

export function characterSubclassFormDataToDB(
  data: Partial<CharacterSubclassFormData>,
): {
  resource: Partial<DBCharacterSubclass>;
  translation: Partial<DBCharacterSubclassTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      character_class_id: data.character_class_id,
    },
    translation: {
      ...translation,
    },
  };
}

//------------------------------------------------------------------------------
// Character Subclass Form
//------------------------------------------------------------------------------

export const characterSubclassForm = createForm(
  "character_subclass",
  characterSubclassFormDataSchema.parse,
);
