import { createResourcesStore } from "../resources-store";
import {
  creatureFiltersSchema,
  creatureSchema,
  defaultCreatureFilters,
} from "./creature";
import { useLocalizeCreature } from "./localized-creature";

//------------------------------------------------------------------------------
// Creatures Store
//------------------------------------------------------------------------------

export const creaturesStore = createResourcesStore(
  { p: "creatures", s: "creature" },
  creatureSchema,
  creatureFiltersSchema,
  defaultCreatureFilters,
  useLocalizeCreature,
);

export const {
  useFromCampaign: useCreaturesFromCampaign,
  useFilters: useCreatureFilters,
  useNameFilter: useCreatureNameFilter,
  useIsSelected: useIsCreatureSelected,
  useSelectionCount: useCreaturesSelectionCount,
  create: createCreature,
  update: updateCreature,
} = creaturesStore;
