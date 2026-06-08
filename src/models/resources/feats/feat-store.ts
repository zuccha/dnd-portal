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

export const featStore = createResourceStore(
  { p: "feats", s: "feat" },
  {
    defaultFilters: defaultFeatFilters,
    defaultResource: defaultFeat,
    filtersSchema: featFiltersSchema,
    kinds: ["feat"],
    orderOptions: featOrderOptions,
    resourceSchema: featSchema,
    translationFields: featTranslationFields,
    useLocalizeResource: useLocalizeFeat,
  },
);
