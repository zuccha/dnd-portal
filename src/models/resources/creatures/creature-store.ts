import { matchesInclusion, matchesInclusionList } from "../resource-filtering";
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

export const creatureStore = createResourceStore("creature", {
  defaultFilters: defaultCreatureFilters,
  defaultResource: defaultCreature,
  displayName: { en: "Creatures", it: "Creature" },
  filtersSchema: creatureFiltersSchema,
  matchesResource: (creature, filters) =>
    creature.cr >= filters.cr_min &&
    creature.cr <= filters.cr_max &&
    matchesInclusion(creature.alignment, filters.alignment) &&
    matchesInclusion(creature.size, filters.size) &&
    matchesInclusion(creature.type, filters.types) &&
    matchesInclusionList(creature.habitats, filters.habitats) &&
    matchesInclusionList(creature.treasures, filters.treasures),
  orderOptions: creatureOrderOptions,
  resourceSchema: creatureSchema,
  translationFields: creatureTranslationFields,
  useLocalizeResource: useLocalizeCreature,
});
