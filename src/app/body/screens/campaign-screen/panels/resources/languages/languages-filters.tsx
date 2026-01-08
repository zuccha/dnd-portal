import { HStack, type StackProps } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { languageStore } from "~/models/resources/languages/language-store";
import { useLanguageRarityOptions } from "~/models/types/language-rarity";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Languages Filters
//------------------------------------------------------------------------------

export default function LanguagesFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = languageStore.useFilters();

  const rarityOptions = useLanguageRarityOptions();

  return (
    <HStack {...props}>
      <InclusionSelect
        includes={filters.rarity ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ rarity: { ...filters.rarity, ...partial } })
        }
        options={rarityOptions}
        size="sm"
      >
        {t("rarity")}
      </InclusionSelect>
    </HStack>
  );
}

const i18nContext = {
  rarity: {
    en: "Rarity",
    it: "Rarità",
  },
};
