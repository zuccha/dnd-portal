import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Service Category
//------------------------------------------------------------------------------

export const serviceCategorySchema = z.enum([
  "lifestyle",
  "food_drink",
  "lodging",
  "hireling",
  "spellcasting",
  "transport",
]);

export const serviceCategories = serviceCategorySchema.options;

export type ServiceCategory = z.infer<typeof serviceCategorySchema>;

//------------------------------------------------------------------------------
// Service Category Translation Hooks
//------------------------------------------------------------------------------

export const {
  useSortedOptions: useServiceCategoryOptions,
  useTranslate: useTranslateServiceCategory,
  useTranslations: useServiceCategoryTranslations,
} = createTypeTranslationHooks(serviceCategories, {
  food_drink: { en: "Food & Drink", it: "Cibo e Bevande" },
  hireling: { en: "Hireling", it: "Gregario" },
  lifestyle: { en: "Lifestyle", it: "Stile di Vita" },
  lodging: { en: "Lodging", it: "Alloggio" },
  spellcasting: { en: "Spellcasting", it: "Lancio di Incantesimi" },
  transport: { en: "Transport", it: "Trasporto" },
});
