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

export const creatureStore = createResourceStore(
  { p: "creatures", s: "creature" },
  {
    defaultFilters: defaultCreatureFilters,
    defaultResource: defaultCreature,
    displayName: { en: "Creatures", it: "Creature" },
    filtersSchema: creatureFiltersSchema,
    kinds: ["creature"],
    orderOptions: creatureOrderOptions,
    resourceSchema: creatureRawSchema,
    translationFields: creatureTranslationFields,
    useLocalizeResource: useLocalizeCreature,
  },
);
