import { HStack } from "@chakra-ui/react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { useSpellFilters } from "../../../../../../resources/spells";
import InclusionButton from "../../../../../../ui/inclusion-button";

//------------------------------------------------------------------------------
// Spells Filters
//------------------------------------------------------------------------------

export default function SpellsFilters() {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = useSpellFilters();

  return (
    <HStack>
      <InclusionButton
        include={filters.ritual}
        onValueChange={(ritual) => setFilters({ ritual })}
        size="sm"
      >
        {t("ritual")}
      </InclusionButton>

      <InclusionButton
        include={filters.concentration}
        onValueChange={(concentration) => setFilters({ concentration })}
        size="sm"
      >
        {t("concentration")}
      </InclusionButton>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  concentration: {
    en: "C",
    it: "C",
  },

  ritual: {
    en: "R",
    it: "R",
  },
};
