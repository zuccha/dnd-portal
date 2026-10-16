import { matchesInclusion, matchesInclusionList } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { creatureTranslationFields, defaultCreature } from "./creature";
import {
  creatureFiltersSchema,
  creatureOrderOptions,
  defaultCreatureFilters,
} from "./creature-filters";
import { localizeCreature, useCreatureLocalizationContext } from "./localized-creature";

//------------------------------------------------------------------------------
// Creature Store
//------------------------------------------------------------------------------

export const creatureStore = createResourceStore("creature", {
  defaultFilters: defaultCreatureFilters,
  defaultResource: defaultCreature,
  displayName: { en: "Creatures", it: "Creature" },
  filtersSchema: creatureFiltersSchema,
  matchesResource: (creature, filters) =>
    creature.challenge_rating >= filters.challenge_rating_minimum &&
    creature.challenge_rating <= filters.challenge_rating_maximum &&
    matchesInclusion(creature.alignment, filters.alignment) &&
    matchesInclusionList(creature.sizes, filters.sizes) &&
    matchesInclusion(creature.type, filters.types),
  orderOptions: creatureOrderOptions,
  translationFields: creatureTranslationFields,
  localizeResource: localizeCreature,
  useLocalizationContext: useCreatureLocalizationContext,
});
