import z from "zod";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Creature Habitat
//------------------------------------------------------------------------------

export const creatureHabitatSchema = resourceSchema.extend({
  kind: z.literal("creature_habitat"),
});

export type CreatureHabitat = z.infer<typeof creatureHabitatSchema>;

//------------------------------------------------------------------------------
// Default Creature Habitat
//------------------------------------------------------------------------------

export const defaultCreatureHabitat: CreatureHabitat = {
  ...defaultResource,
  kind: "creature_habitat",
};

//------------------------------------------------------------------------------
// Creature Habitat Translation Fields
//------------------------------------------------------------------------------

export const creatureHabitatTranslationFields: TranslationFields<CreatureHabitat>[] = [
  ...resourceTranslationFields,
];
