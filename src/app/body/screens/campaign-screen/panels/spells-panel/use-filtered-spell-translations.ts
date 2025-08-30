import {
  useCampaignSpells,
  useSpellNameFilter,
} from "../../../../../../resources/spell";
import { useTranslateSpell } from "../../../../../../resources/spell-translation";
import { createUseFilteredResourceTranslations } from "../use-filtered-resource-translations";

//------------------------------------------------------------------------------
// Use Filtered Spells
//------------------------------------------------------------------------------

const useFilteredSpellTranslations = createUseFilteredResourceTranslations(
  useCampaignSpells,
  useTranslateSpell,
  useSpellNameFilter
);

export default useFilteredSpellTranslations;
