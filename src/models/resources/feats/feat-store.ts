import { createResourceStore } from "../resource-store";
import { defaultFeat, featSchema, featTranslationFields } from "./feat";
import {
  defaultFeatFilters,
  featFiltersSchema,
  featOrderOptions,
} from "./feat-filters";
import { useLocalizeFeat } from "./localized-feat";

//------------------------------------------------------------------------------
// Feat Store
//------------------------------------------------------------------------------

export const featStore = createResourceStore("feat", {
  defaultFilters: defaultFeatFilters,
  defaultResource: defaultFeat,
  displayName: { en: "Feats", it: "Talenti" },
  filtersSchema: featFiltersSchema,
  orderOptions: featOrderOptions,
  resourceSchema: featSchema,
  translationFields: featTranslationFields,
  useLocalizeResource: useLocalizeFeat,
});
