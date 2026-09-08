import { createResourceStore } from "../resource-store";
import { useLocalizeSpell } from "./localized-spell";
import { defaultSpell, spellSchema, spellTranslationFields } from "./spell";
import {
  defaultSpellFilters,
  spellFiltersSchema,
  spellOrderOptions,
} from "./spell-filters";

//------------------------------------------------------------------------------
// Spell Store
//------------------------------------------------------------------------------

export const spellStore = createResourceStore("spell", {
  defaultFilters: defaultSpellFilters,
  defaultResource: defaultSpell,
  displayName: { en: "Spells", it: "Incantesimi" },
  filtersSchema: spellFiltersSchema,
  orderOptions: spellOrderOptions,
  resourceSchema: spellSchema,
  translationFields: spellTranslationFields,
  useLocalizeResource: useLocalizeSpell,
});
