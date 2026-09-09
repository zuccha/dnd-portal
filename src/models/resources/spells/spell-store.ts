import {
  compareNames,
  compareNumbers,
  matchesBoolean,
  matchesInclusion,
  matchesInclusionList,
} from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { useLocalizeSpell } from "./localized-spell";
import { defaultSpell, spellTranslationFields } from "./spell";
import {
  defaultSpellFilters,
  spellFiltersSchema,
  spellOrderOptions,
} from "./spell-filters";

//------------------------------------------------------------------------------
// Spell Store
//------------------------------------------------------------------------------

export const spellStore = createResourceStore("spell", {
  compareResources: (a, b, filters, lang) =>
    filters.order_by === "level" ?
      compareNumbers(a.level, b.level, filters.order_dir) ||
      compareNames(a, b, lang, "asc")
    : compareNames(a, b, lang, filters.order_dir),
  defaultFilters: defaultSpellFilters,
  defaultResource: defaultSpell,
  displayName: { en: "Spells", it: "Incantesimi" },
  filtersSchema: spellFiltersSchema,
  matchesResource: (spell, filters) =>
    matchesBoolean(spell.concentration, filters.concentration) &&
    matchesBoolean(spell.material, filters.material) &&
    matchesBoolean(spell.ritual, filters.ritual) &&
    matchesBoolean(spell.somatic, filters.somatic) &&
    matchesBoolean(spell.verbal, filters.verbal) &&
    matchesInclusion(spell.casting_time, filters.casting_time) &&
    matchesInclusion(spell.level, filters.levels) &&
    matchesInclusion(spell.school, filters.schools) &&
    matchesInclusionList(
      spell.character_class_ids,
      filters.character_class_ids,
    ),
  orderOptions: spellOrderOptions,
  translationFields: spellTranslationFields,
  useLocalizeResource: useLocalizeSpell,
});
