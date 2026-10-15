import z from "zod";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Creature Treasure Schema
//------------------------------------------------------------------------------

export const creatureTreasureSchema = resourceSchema.extend({
  kind: z.literal("creature_treasure"),
});

//------------------------------------------------------------------------------
// Creature Treasure
//------------------------------------------------------------------------------

export type CreatureTreasure = z.infer<typeof creatureTreasureSchema>;

//------------------------------------------------------------------------------
// Default Creature Treasure
//------------------------------------------------------------------------------

export const defaultCreatureTreasure: CreatureTreasure = {
  ...defaultResource,
  kind: "creature_treasure",
};

//------------------------------------------------------------------------------
// Creature Treasure Translation Fields
//------------------------------------------------------------------------------

export const creatureTreasureTranslationFields: TranslationFields<CreatureTreasure>[] = [
  ...resourceTranslationFields,
];
