import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { speciesStore } from "~/models/resources/species/species-store";
import { useCreatureSizeOptions } from "~/models/types/creature-size";
import { useCreatureTypeOptions } from "~/models/types/creature-type";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Species Filters
//------------------------------------------------------------------------------

export default function SpeciesFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = speciesStore.useFilters();

  const typeOptions = useCreatureTypeOptions();
  const sizeOptions = useCreatureSizeOptions();

  return (
    <VStack {...props}>
      <CaptionInput caption={t("types")} w="full">
        <InclusionSelect
          includes={filters.types ?? {}}
          onValueChange={(partial) =>
            setFilters({ types: { ...filters.types, ...partial } })
          }
          options={typeOptions}
          placeholder={t("types")}
          size="sm"
          w="full"
        />
      </CaptionInput>

      <CaptionInput caption={t("sizes")} w="full">
        <InclusionSelect
          includes={filters.sizes ?? {}}
          onValueChange={(partial) =>
            setFilters({ sizes: { ...filters.sizes, ...partial } })
          }
          options={sizeOptions}
          placeholder={t("sizes")}
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
  sizes: {
    en: "Sizes",
    it: "Taglie",
  },
  types: {
    en: "Types",
    it: "Tipi",
  },
};
