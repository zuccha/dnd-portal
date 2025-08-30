import {
  useCampaignWeapons,
  useWeaponNameFilter,
} from "../../../../../../resources/weapon";
import { useTranslateWeapon } from "../../../../../../resources/weapon-translation";
import { createUseFilteredResourceTranslations } from "../use-filtered-resource-translations";

//------------------------------------------------------------------------------
// Use Filtered Weapons
//------------------------------------------------------------------------------

const useFilteredWeaponTranslations = createUseFilteredResourceTranslations(
  useCampaignWeapons,
  useTranslateWeapon,
  useWeaponNameFilter
);

export default useFilteredWeaponTranslations;
