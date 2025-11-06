import { createResourcesStore } from "../resources-store";
import { useLocalizeSpell } from "./localized-spell";
import { defaultSpellFilters, spellFiltersSchema, spellSchema } from "./spell";

//------------------------------------------------------------------------------
// Spells Store
//------------------------------------------------------------------------------

export const spellsStore = createResourcesStore(
  { p: "spells", s: "spell" },
  spellSchema,
  spellFiltersSchema,
  defaultSpellFilters,
  useLocalizeSpell
);

export const {
  useFromCampaign: useSpellsFromCampaign,
  useFilters: useSpellFilters,
  useNameFilter: useSpellNameFilter,
  useIsSelected: useIsSpellSelected,
  useSelectionCount: useSpellsSelectionCount,
  create: createSpell,
  update: updateSpell,
} = spellsStore;
