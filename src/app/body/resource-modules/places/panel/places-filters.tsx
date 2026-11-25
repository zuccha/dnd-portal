import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { placeStore } from "~/models/resources/places/place-store";
import { usePlaceTypeOptions } from "~/models/types/place-type";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Places Filters
//------------------------------------------------------------------------------

const usePlaceFilters = placeStore.useFilters;

export default function PlacesFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, { set: setFilters }] = usePlaceFilters();
  const options = usePlaceTypeOptions();

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
