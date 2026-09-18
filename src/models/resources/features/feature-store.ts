import { createResourceStore } from "../resource-store";
import { defaultFeature, featureTranslationFields } from "./feature";
import {
  defaultFeatureFilters,
  featureFiltersSchema,
  featureOrderOptions,
} from "./feature-filters";
import { localizeFeature, useFeatureLocalizationContext } from "./localized-feature";

//------------------------------------------------------------------------------
// Feature Store
//------------------------------------------------------------------------------

export const featureStore = createResourceStore("feature", {
  defaultFilters: defaultFeatureFilters,
  defaultResource: defaultFeature,
  displayName: { en: "Features", it: "Privilegi" },
  filtersSchema: featureFiltersSchema,
  orderOptions: featureOrderOptions,
  translationFields: featureTranslationFields,
  localizeResource: localizeFeature,
  useLocalizationContext: useFeatureLocalizationContext,
});
