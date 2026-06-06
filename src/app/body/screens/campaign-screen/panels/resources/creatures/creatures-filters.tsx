import { HStack, type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import { useCreatureHabitatOptions } from "~/models/types/creature-habitat";
import { useCreatureSizeOptions } from "~/models/types/creature-size";
import { useCreatureTreasureOptions } from "~/models/types/creature-treasure";
import { useCreatureTypeOptions } from "~/models/types/creature-type";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";
import NumberInput from "~/ui/number-input";

//------------------------------------------------------------------------------
// Creatures Filters
//------------------------------------------------------------------------------

export default function CreaturesFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = creatureStore.useFilters();

  const typeOptions = useCreatureTypeOptions();
  const habitatOptions = useCreatureHabitatOptions();
  const treasureOptions = useCreatureTreasureOptions();
  const alignmentOptions = useCreatureAlignmentOptions();
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
          size="sm"
          w="full"
        >
          {t("types")}
        </InclusionSelect>
      </CaptionInput>

      <CaptionInput caption={t("size")} w="full">
        <InclusionSelect
          includes={filters.size ?? {}}
          onValueChange={(partial) =>
            setFilters({ size: { ...filters.size, ...partial } })
          }
          options={sizeOptions}
          size="sm"
          w="full"
        >
          {t("size")}
        </InclusionSelect>
      </CaptionInput>

      <CaptionInput caption={t("alignment")} w="full">
        <InclusionSelect
          includes={filters.alignment ?? {}}
          onValueChange={(partial) =>
            setFilters({ alignment: { ...filters.alignment, ...partial } })
          }
          options={alignmentOptions}
          size="sm"
          w="full"
        >
          {t("alignment")}
        </InclusionSelect>
      </CaptionInput>

      <CaptionInput caption={t("habitats")} w="full">
        <InclusionSelect
          includes={filters.habitats ?? {}}
          onValueChange={(partial) =>
            setFilters({ habitats: { ...filters.habitats, ...partial } })
          }
          options={habitatOptions}
          size="sm"
          w="full"
        >
          {t("habitats")}
        </InclusionSelect>
      </CaptionInput>

      <CaptionInput caption={t("treasures")} w="full">
        <InclusionSelect
          includes={filters.treasures ?? {}}
          onValueChange={(partial) =>
            setFilters({ treasures: { ...filters.treasures, ...partial } })
          }
          options={treasureOptions}
          size="sm"
          w="full"
        >
          {t("treasures")}
        </InclusionSelect>
      </CaptionInput>

      <HStack w="full">
        <CaptionInput caption={t("cr_min")} flex={1}>
          <NumberInput
            inputProps={{ minW: "4em" }}
            max={filters.cr_max}
            min={0}
            onValueChange={(value) => setFilters({ cr_min: value })}
            size="sm"
            value={filters.cr_min}
          />
        </CaptionInput>

        <CaptionInput caption={t("cr_max")} flex={1}>
          <NumberInput
            inputProps={{ minW: "4em" }}
            min={filters.cr_min}
            onValueChange={(value) => setFilters({ cr_max: value })}
            size="sm"
            value={filters.cr_max}
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
  habitats: {
    en: "Habitats",
    it: "Habitat",
  },
  size: {
    en: "Size",
    it: "Taglia",
  },
  treasures: {
    en: "Treasures",
    it: "Tesori",
  },
  types: {
    en: "Types",
    it: "Tipi",
  },
};
