import { useMemo } from "react";
import {
  useCampaignSpells,
  useSpellNameFilter,
} from "../../../../../../resources/spell";
import {
  type SpellTranslation,
  useTranslateSpell,
} from "../../../../../../resources/spell-translation";

//------------------------------------------------------------------------------
// Use Filtered Spells
//------------------------------------------------------------------------------

export default function useFilteredSpellTranslations(
  campaignId: string
): SpellTranslation[] | undefined {
  const { data: spells } = useCampaignSpells(campaignId);
  const translateSpell = useTranslateSpell();
  const [nameFilter] = useSpellNameFilter();

  const spellTranslations = useMemo(
    () => (spells ? spells.map(translateSpell) : undefined),
    [spells, translateSpell]
  );

  return useMemo(() => {
    const trimmedNameFilter = nameFilter.trim().toLowerCase();
    return spellTranslations
      ? spellTranslations.filter((spell) => {
          const names = Object.values(spell._raw.name);
          return names.some((name) =>
            name?.trim().toLowerCase().includes(trimmedNameFilter)
          );
        })
      : undefined;
  }, [nameFilter, spellTranslations]);
}
