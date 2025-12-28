import { createResourceStore } from "../resource-store";
import { creatureSchema, defaultCreature } from "./creature";
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
    orderOptions: creatureOrderOptions,
    resourceSchema: creatureSchema,
    useLocalizeResource: useLocalizeCreature,
  },
);
