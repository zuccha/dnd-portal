import { createResourceStore } from "../resource-store";
import {
  creatureFiltersSchema,
  creatureSchema,
  defaultCreature,
  defaultCreatureFilters,
} from "./creature";
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
    resourceSchema: creatureSchema,
    useLocalizeResource: useLocalizeCreature,
  },
);
