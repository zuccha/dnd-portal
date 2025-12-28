import { createResourceStore } from "../resource-store";
import { useLocalizeSpell } from "./localized-spell";
import { defaultSpell, spellSchema } from "./spell";
import {
  defaultSpellFilters,
  spellFiltersSchema,
  spellOrderOptions,
} from "./spell-filters";

//------------------------------------------------------------------------------
// Spell Store
//------------------------------------------------------------------------------

export const spellStore = createResourceStore(
  { p: "spells", s: "spell" },
  {
    defaultFilters: defaultSpellFilters,
    defaultResource: defaultSpell,
    filtersSchema: spellFiltersSchema,
    orderOptions: spellOrderOptions,
    resourceSchema: spellSchema,
    useLocalizeResource: useLocalizeSpell,
  },
);
