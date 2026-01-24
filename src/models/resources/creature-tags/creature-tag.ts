import z from "zod";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Creature Tag
//------------------------------------------------------------------------------

export const creatureTagSchema = resourceSchema.extend({});

export type CreatureTag = z.infer<typeof creatureTagSchema>;

//------------------------------------------------------------------------------
// Default Creature Tag
//------------------------------------------------------------------------------

export const defaultCreatureTag: CreatureTag = {
  ...defaultResource,
};

//------------------------------------------------------------------------------
// Creature Tag Translation Fields
//------------------------------------------------------------------------------

export const creatureTagTranslationFields: TranslationFields<CreatureTag>[] = [
  ...resourceTranslationFields,
];
