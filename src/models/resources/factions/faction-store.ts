import { matchesInclusion } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { defaultFaction, factionTranslationFields } from "./faction";
import {
  defaultFactionFilters,
  factionFiltersSchema,
  factionOrderOptions,
} from "./faction-filters";
import { localizeFaction, useFactionLocalizationContext } from "./localized-faction";

//------------------------------------------------------------------------------
// Faction Store
//------------------------------------------------------------------------------

export const factionStore = createResourceStore("faction", {
  defaultFilters: defaultFactionFilters,
  defaultResource: defaultFaction,
  displayName: { en: "Factions", it: "Fazioni" },
  filtersSchema: factionFiltersSchema,
  matchesResource: (faction, filters) => matchesInclusion(faction.type, filters.types),
  orderOptions: factionOrderOptions,
  translationFields: factionTranslationFields,
  localizeResource: localizeFaction,
  useLocalizationContext: useFactionLocalizationContext,
});
