import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { factionStore } from "~/models/resources/factions/faction-store";
import { useFactionTypeOptions } from "~/models/types/faction-type";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Factions Filters
//------------------------------------------------------------------------------

const useFactionFilters = factionStore.useFilters;

export default function FactionsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, { set: setFilters }] = useFactionFilters();
  const options = useFactionTypeOptions();

  return (
    <VStack {...props}>
      <CaptionInput caption={t("types")} w="full">
        <InclusionSelect
          includes={filters.types ?? {}}
          onValueChange={(types) => setFilters({ types: { ...filters.types, ...types } })}
          options={options}
          placeholder={t("types")}
          size="sm"
          w="full"
        />
      </CaptionInput>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  types: { en: "Types", it: "Tipi" },
};
