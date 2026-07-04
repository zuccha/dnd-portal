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

export const creatureTagSchema = resourceSchema.extend({
  kind: z.literal("creature_tag"),
});

export type CreatureTag = z.infer<typeof creatureTagSchema>;

//------------------------------------------------------------------------------
// Default Creature Tag
//------------------------------------------------------------------------------

export const defaultCreatureTag: CreatureTag = {
  ...defaultResource,
  kind: "creature_tag",
};

//------------------------------------------------------------------------------
// Creature Tag Translation Fields
//------------------------------------------------------------------------------

export const creatureTagTranslationFields: TranslationFields<CreatureTag>[] = [
  ...resourceTranslationFields,
];
