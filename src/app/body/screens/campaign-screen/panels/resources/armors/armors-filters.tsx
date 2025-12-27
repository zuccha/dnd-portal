import {
  HStack,
  Separator,
  type StackProps,
  createListCollection,
} from "@chakra-ui/react";
import { WandIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import useDebouncedState from "~/hooks/use-debounced-value";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type ArmorFilters } from "~/models/resources/equipment/armors/armor";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import { useArmorTypeOptions } from "~/models/types/armor-type";
import Icon from "~/ui/icon";
import InclusionButton from "~/ui/inclusion-button";
import InclusionSelect from "~/ui/inclusion-select";
import Input from "~/ui/input";
import Select from "~/ui/select";

//------------------------------------------------------------------------------
// Armors Filters
//------------------------------------------------------------------------------

export default function ArmorsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = armorStore.useFilters();

  const [tempNameFilter, setTempNameFilter] = useDebouncedState(
    filters.name,
    useCallback((name) => setFilters({ name }), [setFilters]),
    200,
  );

  const orderOptions = useMemo(
    () =>
      createListCollection({
        items: orders.map((value) => ({ label: t(`order.${value}`), value })),
      }),
    [t],
  );

  const typeOptions = useArmorTypeOptions();

  return (
    <HStack {...props}>
      <Select
        minW="13.5em"
        onValueChange={(value) => {
          const [order_by, order_dir] = value.split(".") as [
            ArmorFilters["order_by"],
            ArmorFilters["order_dir"],
          ];
          setFilters({ order_by, order_dir });
        }}
        options={orderOptions}
        size="sm"
        value={`${filters.order_by}.${filters.order_dir}`}
        w="13.5em"
      />

      <Separator h="1.5em" orientation="vertical" />

      <Input
        groupProps={{ w: "auto" }}
        id="filter-armor-name"
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

      <InclusionButton
        include={filters.magic}
        onValueChange={(magic) => setFilters({ magic })}
        size="sm"
      >
        <Icon Icon={WandIcon} size="sm" />
      </InclusionButton>
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
  "name": {
    en: "Name",
    it: "Nome",
  },
  "order.name.asc": {
    en: "Sort by Name (A-Z)",
    it: "Ordina per Nome (A-Z)",
  },
  "order.name.desc": {
    en: "Sort by Name (Z-A)",
    it: "Ordina per Nome (Z-A)",
  },
  "types": {
    en: "Type",
    it: "Tipo",
  },
};
