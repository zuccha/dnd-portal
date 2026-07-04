import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureTypeSchema } from "../../types/creature-type";
import { dbFeatureEntrySchema } from "../features/db-feature";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Species
//------------------------------------------------------------------------------

export const speciesSchema = resourceSchema.extend({
  description: i18nStringSchema,
  feature_entries: z.array(dbFeatureEntrySchema),
  kind: z.literal("species"),
  sizes: z.array(creatureSizeSchema).min(1),
  speed: z.number(),
  type: creatureTypeSchema,
});

export type Species = z.infer<typeof speciesSchema>;

//------------------------------------------------------------------------------
// Default Species
//------------------------------------------------------------------------------

export const defaultSpecies: Species = {
  ...defaultResource,
  description: {},
  feature_entries: [],
  kind: "species",
  sizes: ["medium"],
  speed: 900,
  type: "humanoid",
};

//------------------------------------------------------------------------------
// Species Translation Fields
//------------------------------------------------------------------------------

export const speciesTranslationFields: TranslationFields<Species>[] = [
  ...resourceTranslationFields,
  "description",
];
