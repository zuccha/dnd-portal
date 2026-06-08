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

export const speciesStore = createResourceStore(
  { p: "species", s: "species" },
  {
    defaultFilters: defaultSpeciesFilters,
    defaultResource: defaultSpecies,
    filtersSchema: speciesFiltersSchema,
    kinds: ["species"],
    orderOptions: speciesOrderOptions,
    resourceSchema: speciesSchema,
    translationFields: speciesTranslationFields,
    useLocalizeResource: useLocalizeSpecies,
  },
);
