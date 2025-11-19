import { HStack, Separator, createListCollection } from "@chakra-ui/react";
import { useMemo } from "react";
import useDebouncedState from "~/hooks/use-debounced-value";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type CreatureFilters } from "~/resources/creatures/creature";
import { creaturesStore } from "~/resources/creatures/creatures-store";
import { useCreatureAlignmentOptions } from "~/resources/types/creature-alignment";
import { useCreatureHabitatOptions } from "~/resources/types/creature-habitat";
import { useCreatureSizeOptions } from "~/resources/types/creature-size";
import { useCreatureTreasureOptions } from "~/resources/types/creature-treasure";
import { useCreatureTypeOptions } from "~/resources/types/creature-type";
import InclusionSelect from "~/ui/inclusion-select";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";

//------------------------------------------------------------------------------
// Creatures Filters
//------------------------------------------------------------------------------

export default function CreaturesFilters() {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = creaturesStore.useFilters();

  const [nameFilter, setNameFilter] = creaturesStore.useNameFilter();
  const [tempNameFilter, setTempNameFilter] = useDebouncedState(
    nameFilter,
    setNameFilter,
    200,
  );

  const orderOptions = useMemo(
    () =>
      createListCollection({
        items: orders.map((value) => ({ label: t(`order.${value}`), value })),
      }),
    [t],
  );

  const typeOptions = useCreatureTypeOptions();
  const habitatOptions = useCreatureHabitatOptions();
  const treasureOptions = useCreatureTreasureOptions();
  const alignmentOptions = useCreatureAlignmentOptions();
  const sizeOptions = useCreatureSizeOptions();

  return (
    <HStack>
      <Select
        minW="13.5em"
        onValueChange={(value) => {
          const [order_by, order_dir] = value.split(".") as [
            CreatureFilters["order_by"],
            CreatureFilters["order_dir"],
          ];
          setFilters({ order_by, order_dir });
        }}
        options={orderOptions}
        size="sm"
        value={`${filters.order_by}.${filters.order_dir}`}
      />

      <Separator h="1.5em" orientation="vertical" />

      <Input
        id="filter-creature-name"
        onValueChange={setTempNameFilter}
        placeholder={t("name")}
        size="sm"
        value={tempNameFilter}
        w="15em"
      />

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

      <NumberInput
        inputProps={{ minW: "5em" }}
        max={filters.cr_max}
        min={0}
        onValueChange={(value) => setFilters({ cr_min: value })}
        size="sm"
        value={filters.cr_min}
      />

      <NumberInput
        inputProps={{ minW: "5em" }}
        min={filters.cr_min}
        onValueChange={(value) => setFilters({ cr_max: value })}
        size="sm"
        value={filters.cr_max}
      />

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
// Orders
//------------------------------------------------------------------------------

const orders = ["name.asc", "name.desc"];

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "order.name.asc": {
    en: "Sort by Name (A-Z)",
    it: "Ordina per Nome (A-Z)",
  },

  "order.name.desc": {
    en: "Sort by Name (Z-A)",
    it: "Ordina per Nome (Z-A)",
  },

  "alignment": {
    en: "Alignment",
    it: "Allineamento",
  },

  "cr_max": {
    en: "Max CR",
    it: "CR Max",
  },

  "cr_min": {
    en: "Min CR",
    it: "CR Min",
  },

  "habitats": {
    en: "Habitats",
    it: "Habitat",
  },

  "name": {
    en: "Name",
    it: "Nome",
  },

  "size": {
    en: "Size",
    it: "Taglia",
  },

  "treasures": {
    en: "Treasures",
    it: "Tesori",
  },

  "types": {
    en: "Types",
    it: "Tipi",
  },
};
