import { createResourceStore } from "../resource-store";
import { defaultCreatureTag } from "./creature-tag";
import {
  creatureTagFiltersSchema,
  creatureTagOrderOptions,
  defaultCreatureTagFilters,
} from "./creature-tag-filters";
import { useLocalizeCreatureTag } from "./localized-creature-tag";

//------------------------------------------------------------------------------
// Creature Tag Store
//------------------------------------------------------------------------------

export const creatureTagStore = createResourceStore("creature_tag", {
  defaultFilters: defaultCreatureTagFilters,
  defaultResource: defaultCreatureTag,
  displayName: { en: "Groups", it: "Gruppi" },
  filtersSchema: creatureTagFiltersSchema,
  orderOptions: creatureTagOrderOptions,
  useLocalizeResource: useLocalizeCreatureTag,
});
