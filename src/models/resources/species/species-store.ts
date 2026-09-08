import { createResourceStore } from "../resource-store";
import { useLocalizeSpecies } from "./localized-species";
import {
  defaultSpecies,
  speciesSchema,
  speciesTranslationFields,
} from "./species";
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
  orderOptions: speciesOrderOptions,
  resourceSchema: speciesSchema,
  translationFields: speciesTranslationFields,
  useLocalizeResource: useLocalizeSpecies,
});
