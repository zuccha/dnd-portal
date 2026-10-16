import { HStack, type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import { useCreatureSizeOptions } from "~/models/types/creature-size";
import { useCreatureTypeOptions } from "~/models/types/creature-type";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";
import NumberInput from "~/ui/number-input";

//------------------------------------------------------------------------------
// Creatures Filters
//------------------------------------------------------------------------------

const useCreatureFilters = creatureStore.useFilters;

export default function CreaturesFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, { set: setFilters }] = useCreatureFilters();

  const typeOptions = useCreatureTypeOptions();
  const alignmentOptions = useCreatureAlignmentOptions();
  const sizeOptions = useCreatureSizeOptions();

  return (
    <VStack {...props}>
      <CaptionInput caption={t("types")} w="full">
        <InclusionSelect
          includes={filters.types ?? {}}
          onValueChange={(partial) => setFilters({ types: { ...filters.types, ...partial } })}
          options={typeOptions}
          placeholder={t("types")}
          size="sm"
          w="full"
        />
      </CaptionInput>

      <CaptionInput caption={t("sizes")} w="full">
        <InclusionSelect
          includes={filters.sizes ?? {}}
          onValueChange={(partial) => setFilters({ sizes: { ...filters.sizes, ...partial } })}
          options={sizeOptions}
          placeholder={t("sizes")}
          size="sm"
          w="full"
        />
      </CaptionInput>

      <CaptionInput caption={t("alignment")} w="full">
        <InclusionSelect
          includes={filters.alignment ?? {}}
          onValueChange={(partial) =>
            setFilters({ alignment: { ...filters.alignment, ...partial } })
          }
          options={alignmentOptions}
          placeholder={t("alignment")}
          size="sm"
          w="full"
        />
      </CaptionInput>

      <HStack w="full">
        <CaptionInput caption={t("cr_min")} flex={1}>
          <NumberInput
            inputProps={{ minW: "4em" }}
            max={filters.challenge_rating_maximum}
            min={0}
            onValueChange={(value) => setFilters({ challenge_rating_minimum: value })}
            size="sm"
            value={filters.challenge_rating_minimum}
          />
        </CaptionInput>

        <CaptionInput caption={t("cr_max")} flex={1}>
          <NumberInput
            inputProps={{ minW: "4em" }}
            min={filters.challenge_rating_minimum}
            onValueChange={(value) => setFilters({ challenge_rating_maximum: value })}
            size="sm"
            value={filters.challenge_rating_maximum}
          />
        </CaptionInput>
      </HStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  alignment: {
    en: "Alignment",
    it: "Allineamento",
  },
  cr_max: {
    en: "Max CR",
    it: "GS Max",
  },
  cr_min: {
    en: "Min CR",
    it: "GS Min",
  },
  sizes: {
    en: "Sizes",
    it: "Taglie",
  },
  types: {
    en: "Types",
    it: "Tipi",
  },
};
