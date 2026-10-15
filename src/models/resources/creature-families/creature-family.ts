import z from "zod";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Creature Family
//------------------------------------------------------------------------------

export const creatureFamilySchema = resourceSchema.extend({
  kind: z.literal("creature_family"),
  plane_ids: z.array(z.uuid()).default([]),
});

//------------------------------------------------------------------------------
// Creature Family
//------------------------------------------------------------------------------

export type CreatureFamily = z.infer<typeof creatureFamilySchema>;

//------------------------------------------------------------------------------
// Default Creature Family
//------------------------------------------------------------------------------

export const defaultCreatureFamily: CreatureFamily = {
  ...defaultResource,
  kind: "creature_family",
  plane_ids: [],
};

//------------------------------------------------------------------------------
// Creature Family Translation Fields
//------------------------------------------------------------------------------

export const creatureFamilyTranslationFields: TranslationFields<CreatureFamily>[] = [
  ...resourceTranslationFields,
];
