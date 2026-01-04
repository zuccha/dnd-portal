import { createResourceStore } from "../resource-store";
import {
  creatureSchema,
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
    filtersSchema: creatureFiltersSchema,
    kinds: ["creature"],
    orderOptions: creatureOrderOptions,
    resourceSchema: creatureSchema,
    translationFields: creatureTranslationFields,
    useLocalizeResource: useLocalizeCreature,
  },
);
