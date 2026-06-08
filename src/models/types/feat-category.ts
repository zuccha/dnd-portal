import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Feat Category
//------------------------------------------------------------------------------

export const featCategorySchema = z.enum([
  "origin",
  "general",
  "fighting_style",
  "epic_boon",
]);

export const featCategories = featCategorySchema.options;

export type FeatCategory = z.infer<typeof featCategorySchema>;

//------------------------------------------------------------------------------
// Feat Category Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useFeatCategoryOptions,
  useTranslate: useTranslateFeatCategory,
  useTranslations: useFeatCategoryTranslations,
} = createTypeTranslationHooks(featCategories, {
  epic_boon: { en: "Epic Boon", it: "Dono Epico" },
  fighting_style: { en: "Fighting Style", it: "Stile di Combattimento" },
  general: { en: "General", it: "Generale" },
  origin: { en: "Origin", it: "Origini" },
});
