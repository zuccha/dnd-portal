import { matchesInclusion } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { defaultDeity, deityTranslationFields } from "./deity";
import { defaultDeityFilters, deityFiltersSchema, deityOrderOptions } from "./deity-filters";
import { localizeDeity, useDeityLocalizationContext } from "./localized-deity";

//------------------------------------------------------------------------------
// Deity Store
//------------------------------------------------------------------------------

export const deityStore = createResourceStore("deity", {
  defaultFilters: defaultDeityFilters,
  defaultResource: defaultDeity,
  displayName: { en: "Deities", it: "Divinità" },
  filtersSchema: deityFiltersSchema,
  matchesResource: (deity, filters) =>
    matchesInclusion(deity.alignment, filters.alignment) &&
    matchesInclusion(deity.domain, filters.domain),
  localizeResource: localizeDeity,
  orderOptions: deityOrderOptions,
  translationFields: deityTranslationFields,
  useLocalizationContext: useDeityLocalizationContext,
});
