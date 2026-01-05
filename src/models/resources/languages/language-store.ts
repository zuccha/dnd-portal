import { createResourceStore } from "../resource-store";
import {
  defaultLanguage,
  languageSchema,
  languageTranslationFields,
} from "./language";
import {
  defaultLanguageFilters,
  languageFiltersSchema,
  languageOrderOptions,
} from "./language-filters";
import { useLocalizeLanguage } from "./localized-language";

//------------------------------------------------------------------------------
// Eldritch Invocation Store
//------------------------------------------------------------------------------

export const languageStore = createResourceStore(
  { p: "languages", s: "language" },
  {
    defaultFilters: defaultLanguageFilters,
    defaultResource: defaultLanguage,
    filtersSchema: languageFiltersSchema,
    kinds: ["language"],
    orderOptions: languageOrderOptions,
    resourceSchema: languageSchema,
    translationFields: languageTranslationFields,
    useLocalizeResource: useLocalizeLanguage,
  },
);
