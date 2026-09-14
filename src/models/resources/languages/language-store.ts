import { matchesInclusion } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { defaultLanguage, languageTranslationFields } from "./language";
import {
  defaultLanguageFilters,
  languageFiltersSchema,
  languageOrderOptions,
} from "./language-filters";
import { useLocalizeLanguage } from "./localized-language";

//------------------------------------------------------------------------------
// Language Store
//------------------------------------------------------------------------------

export const languageStore = createResourceStore("language", {
  defaultFilters: defaultLanguageFilters,
  defaultResource: defaultLanguage,
  displayName: { en: "Languages", it: "Lingue" },
  filtersSchema: languageFiltersSchema,
  matchesResource: (language, filters) => matchesInclusion(language.rarity, filters.rarity),
  orderOptions: languageOrderOptions,
  translationFields: languageTranslationFields,
  useLocalizeResource: useLocalizeLanguage,
});
