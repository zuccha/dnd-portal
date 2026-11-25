import { matchesInclusion } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { localizePlace, usePlaceLocalizationContext } from "./localized-place";
import { defaultPlace, placeTranslationFields } from "./place";
import { defaultPlaceFilters, placeFiltersSchema, placeOrderOptions } from "./place-filters";

//------------------------------------------------------------------------------
// Place Store
//------------------------------------------------------------------------------

export const placeStore = createResourceStore("place", {
  defaultFilters: defaultPlaceFilters,
  defaultResource: defaultPlace,
  displayName: { en: "Places", it: "Luoghi" },
  filtersSchema: placeFiltersSchema,
  matchesResource: (place, filters) => matchesInclusion(place.type, filters.types),
  orderOptions: placeOrderOptions,
  translationFields: placeTranslationFields,
  localizeResource: localizePlace,
  useLocalizationContext: usePlaceLocalizationContext,
});
