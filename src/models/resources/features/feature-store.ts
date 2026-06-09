import { createResourceStore } from "../resource-store";
import {
  defaultFeature,
  featureSchema,
  featureTranslationFields,
} from "./feature";
import {
  defaultFeatureFilters,
  featureFiltersSchema,
  featureOrderOptions,
} from "./feature-filters";
import { useLocalizeFeature } from "./localized-feature";

//------------------------------------------------------------------------------
// Feature Store
//------------------------------------------------------------------------------

export const featureStore = createResourceStore(
  { p: "features", s: "feature" },
  {
    defaultFilters: defaultFeatureFilters,
    defaultResource: defaultFeature,
    filtersSchema: featureFiltersSchema,
    kinds: ["feature"],
    orderOptions: featureOrderOptions,
    resourceSchema: featureSchema,
    translationFields: featureTranslationFields,
    useLocalizeResource: useLocalizeFeature,
  },
);
