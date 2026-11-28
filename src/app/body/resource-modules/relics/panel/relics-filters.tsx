import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { relicStore } from "~/models/resources/relics/relic-store";
import { useRelicTypeOptions } from "~/models/types/relic-type";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Relics Filters
//------------------------------------------------------------------------------

const useRelicFilters = relicStore.useFilters;

export default function RelicsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, { set: setFilters }] = useRelicFilters();
  const options = useRelicTypeOptions();

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
