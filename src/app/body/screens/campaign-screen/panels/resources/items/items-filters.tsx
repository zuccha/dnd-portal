import {
  HStack,
  Separator,
  type StackProps,
  createListCollection,
} from "@chakra-ui/react";
import { WandIcon } from "lucide-react";
import { useMemo } from "react";
import useDebouncedState from "~/hooks/use-debounced-value";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type ItemFilters } from "~/models/resources/equipment/items/item";
import { itemsStore } from "~/models/resources/equipment/items/items-store";
import Icon from "~/ui/icon";
import InclusionButton from "~/ui/inclusion-button";
import Input from "~/ui/input";
import Select from "~/ui/select";

//------------------------------------------------------------------------------
// Items Filters
//------------------------------------------------------------------------------

export default function ItemsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = itemsStore.useFilters();

  const [nameFilter, setNameFilter] = itemsStore.useNameFilter();
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

  return (
    <HStack {...props}>
      <Select
        minW="13.5em"
        onValueChange={(value) => {
          const [order_by, order_dir] = value.split(".") as [
            ItemFilters["order_by"],
            ItemFilters["order_dir"],
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
        id="filter-item-name"
        onValueChange={setTempNameFilter}
        placeholder={t("name")}
        size="sm"
        value={tempNameFilter}
        w="15em"
      />

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
};
