import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { characterLevelSchema } from "../../types/character-level";
import { featCategorySchema } from "../../types/feat-category";
import { dbFeatureEntrySchema } from "../features/db-feature";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Feat
//------------------------------------------------------------------------------

export const featSchema = resourceSchema.extend({
  category: featCategorySchema,
  description: i18nStringSchema,
  feature_entries: z.array(dbFeatureEntrySchema),
  kind: z.literal("feat"),
  min_level: characterLevelSchema,
  prerequisite: i18nStringSchema,
});

export type Feat = z.infer<typeof featSchema>;

//------------------------------------------------------------------------------
// Default Feat
//------------------------------------------------------------------------------

export const defaultFeat: Feat = {
  ...defaultResource,
  category: "general",
  description: {},
  feature_entries: [],
  kind: "feat",
  min_level: 0,
  prerequisite: {},
};

//------------------------------------------------------------------------------
// Feat Translation Fields
//------------------------------------------------------------------------------

export const featTranslationFields: TranslationFields<Feat>[] = [
  ...resourceTranslationFields,
  "description",
  "prerequisite",
];
