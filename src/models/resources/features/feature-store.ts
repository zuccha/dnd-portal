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

export const featureStore = createResourceStore("feature", {
  defaultFilters: defaultFeatureFilters,
  defaultResource: defaultFeature,
  displayName: { en: "Features", it: "Privilegi" },
  filtersSchema: featureFiltersSchema,
  orderOptions: featureOrderOptions,
  resourceSchema: featureSchema,
  translationFields: featureTranslationFields,
  useLocalizeResource: useLocalizeFeature,
});
