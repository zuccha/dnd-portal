import { createResourceStore } from "../resource-store";
import {
  creatureRawSchema,
  creatureTranslationFields,
  defaultCreature,
} from "./creature";
import {
  creatureFiltersSchema,
  creatureOrderOptions,
  defaultCreatureFilters,
} from "./creature-filters";
import { useLocalizeCreature } from "./localized-creature";

//------------------------------------------------------------------------------
// Creature Store
//------------------------------------------------------------------------------

export const creatureStore = createResourceStore("creature", {
  defaultFilters: defaultCreatureFilters,
  defaultResource: defaultCreature,
  displayName: { en: "Creatures", it: "Creature" },
  filtersSchema: creatureFiltersSchema,
  orderOptions: creatureOrderOptions,
  resourceSchema: creatureRawSchema,
  translationFields: creatureTranslationFields,
  useLocalizeResource: useLocalizeCreature,
});
