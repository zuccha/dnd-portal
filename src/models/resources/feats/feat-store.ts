import { matchesInclusion } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { defaultFeat, featTranslationFields } from "./feat";
import { defaultFeatFilters, featFiltersSchema, featOrderOptions } from "./feat-filters";
import { useLocalizeFeat } from "./localized-feat";

//------------------------------------------------------------------------------
// Feat Store
//------------------------------------------------------------------------------

export const featStore = createResourceStore("feat", {
  defaultFilters: defaultFeatFilters,
  defaultResource: defaultFeat,
  displayName: { en: "Feats", it: "Talenti" },
  filtersSchema: featFiltersSchema,
  matchesResource: (feat, filters) =>
    feat.min_level <= filters.level && matchesInclusion(feat.category, filters.categories),
  orderOptions: featOrderOptions,
  translationFields: featTranslationFields,
  useLocalizeResource: useLocalizeFeat,
});
