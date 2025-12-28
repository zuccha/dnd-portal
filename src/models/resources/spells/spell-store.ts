import { createResourceStore } from "../resource-store";
import { useLocalizeSpell } from "./localized-spell";
import { defaultSpell, spellSchema } from "./spell";
import { defaultSpellFilters, spellFiltersSchema } from "./spell-filters";

//------------------------------------------------------------------------------
// Spell Store
//------------------------------------------------------------------------------

export const spellStore = createResourceStore(
  { p: "spells", s: "spell" },
  {
    defaultFilters: defaultSpellFilters,
    defaultResource: defaultSpell,
    filtersSchema: spellFiltersSchema,
    resourceSchema: spellSchema,
    useLocalizeResource: useLocalizeSpell,
  },
);
