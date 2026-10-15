import { createResourceStore } from "../resource-store";
import { defaultCreatureHabitat, creatureHabitatTranslationFields } from "./creature-habitat";
import {
  creatureHabitatFiltersSchema,
  creatureHabitatOrderOptions,
  defaultCreatureHabitatFilters,
} from "./creature-habitat-filters";
import {
  localizeCreatureHabitat,
  useCreatureHabitatLocalizationContext,
} from "./localized-creature-habitat";

//------------------------------------------------------------------------------
// Creature Habitat Store
//------------------------------------------------------------------------------

export const creatureHabitatStore = createResourceStore("creature_habitat", {
  defaultFilters: defaultCreatureHabitatFilters,
  defaultResource: defaultCreatureHabitat,
  displayName: { en: "Habitats", it: "Habitat" },
  filtersSchema: creatureHabitatFiltersSchema,
  orderOptions: creatureHabitatOrderOptions,
  translationFields: creatureHabitatTranslationFields,
  localizeResource: localizeCreatureHabitat,
  useLocalizationContext: useCreatureHabitatLocalizationContext,
});
