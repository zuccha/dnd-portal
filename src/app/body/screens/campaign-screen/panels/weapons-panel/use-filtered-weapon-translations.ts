import { useMemo } from "react";
import {
  useCampaignWeapons,
  useWeaponNameFilter,
} from "../../../../../../resources/weapon";
import {
  type WeaponTranslation,
  useTranslateWeapon,
} from "../../../../../../resources/weapon-translation";

//------------------------------------------------------------------------------
// Use Filtered Weapons
//------------------------------------------------------------------------------

export default function useFilteredWeaponTranslations(
  campaignId: string
): WeaponTranslation[] | undefined {
  const { data: weapons } = useCampaignWeapons(campaignId);
  const translateWeapon = useTranslateWeapon();
  const [nameFilter] = useWeaponNameFilter();

  const weaponTranslations = useMemo(
    () => (weapons ? weapons.map(translateWeapon) : undefined),
    [weapons, translateWeapon]
  );

  return useMemo(() => {
    const trimmedNameFilter = nameFilter.trim().toLowerCase();
    return weaponTranslations
      ? weaponTranslations.filter((weapon) => {
          const names = Object.values(weapon._raw.name);
          return names.some((name) =>
            name?.trim().toLowerCase().includes(trimmedNameFilter)
          );
        })
      : undefined;
  }, [nameFilter, weaponTranslations]);
}
