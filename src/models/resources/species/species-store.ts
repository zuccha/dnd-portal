import { matchesInclusion, matchesInclusionList } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { localizeSpecies, useSpeciesLocalizationContext } from "./localized-species";
import { defaultSpecies, speciesTranslationFields } from "./species";
import {
  defaultSpeciesFilters,
  speciesFiltersSchema,
  speciesOrderOptions,
} from "./species-filters";

//------------------------------------------------------------------------------
// Species Store
//------------------------------------------------------------------------------

export const speciesStore = createResourceStore("species", {
  defaultFilters: defaultSpeciesFilters,
  defaultResource: defaultSpecies,
  displayName: { en: "Species", it: "Specie" },
  filtersSchema: speciesFiltersSchema,
  matchesResource: (species, filters) =>
    matchesInclusion(species.type, filters.types) &&
    matchesInclusionList(species.sizes, filters.sizes),
  orderOptions: speciesOrderOptions,
  translationFields: speciesTranslationFields,
  localizeResource: localizeSpecies,
  useLocalizationContext: useSpeciesLocalizationContext,
});
