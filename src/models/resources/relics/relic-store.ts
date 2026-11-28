import { matchesInclusion } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { localizeRelic, useRelicLocalizationContext } from "./localized-relic";
import { defaultRelic, relicTranslationFields } from "./relic";
import { defaultRelicFilters, relicFiltersSchema, relicOrderOptions } from "./relic-filters";

//------------------------------------------------------------------------------
// Relic Store
//------------------------------------------------------------------------------

export const relicStore = createResourceStore("relic", {
  defaultFilters: defaultRelicFilters,
  defaultResource: defaultRelic,
  displayName: { en: "Relics", it: "Reliquie" },
  filtersSchema: relicFiltersSchema,
  localizeResource: localizeRelic,
  matchesResource: (relic, filters) => matchesInclusion(relic.type, filters.types),
  orderOptions: relicOrderOptions,
  translationFields: relicTranslationFields,
  useLocalizationContext: useRelicLocalizationContext,
});
