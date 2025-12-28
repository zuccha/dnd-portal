import { HStack, type StackProps } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import { useCreatureHabitatOptions } from "~/models/types/creature-habitat";
import { useCreatureSizeOptions } from "~/models/types/creature-size";
import { useCreatureTreasureOptions } from "~/models/types/creature-treasure";
import { useCreatureTypeOptions } from "~/models/types/creature-type";
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
    <HStack {...props}>
      <InclusionSelect
        includes={filters.types ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ types: { ...filters.types, ...partial } })
        }
        options={typeOptions}
        size="sm"
      >
        {t("types")}
      </InclusionSelect>

      <InclusionSelect
        includes={filters.size ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ size: { ...filters.size, ...partial } })
        }
        options={sizeOptions}
        size="sm"
      >
        {t("size")}
      </InclusionSelect>

      <InclusionSelect
        includes={filters.alignment ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ alignment: { ...filters.alignment, ...partial } })
        }
        options={alignmentOptions}
        size="sm"
      >
        {t("alignment")}
      </InclusionSelect>

      <HStack>
        <NumberInput
          inputProps={{ minW: "4em" }}
          max={filters.cr_max}
          min={0}
          onValueChange={(value) => setFilters({ cr_min: value })}
          size="sm"
          value={filters.cr_min}
          w="4em"
        />

        <NumberInput
          inputProps={{ minW: "4em" }}
          min={filters.cr_min}
          onValueChange={(value) => setFilters({ cr_max: value })}
          size="sm"
          value={filters.cr_max}
          w="4em"
        />
      </HStack>

      <InclusionSelect
        includes={filters.habitats ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ habitats: { ...filters.habitats, ...partial } })
        }
        options={habitatOptions}
        size="sm"
      >
        {t("habitats")}
      </InclusionSelect>

      <InclusionSelect
        includes={filters.treasures ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ treasures: { ...filters.treasures, ...partial } })
        }
        options={treasureOptions}
        size="sm"
      >
        {t("treasures")}
      </InclusionSelect>
    </HStack>
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
    it: "CR Max",
  },
  cr_min: {
    en: "Min CR",
    it: "CR Min",
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
