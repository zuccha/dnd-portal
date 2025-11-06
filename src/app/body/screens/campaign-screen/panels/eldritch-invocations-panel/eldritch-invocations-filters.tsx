import { HStack, Separator, createListCollection } from "@chakra-ui/react";
import { useMemo } from "react";
import useDebouncedState from "../../../../../../hooks/use-debounced-value";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { type EldritchInvocationFilters } from "../../../../../../resources/eldritch-invocations/eldritch-invocation";
import { eldritchInvocationsStore } from "../../../../../../resources/eldritch-invocations/eldritch-invocations-store";
import Input from "../../../../../../ui/input";
import NumberInput from "../../../../../../ui/number-input";
import Select from "../../../../../../ui/select";

//------------------------------------------------------------------------------
// EldritchInvocations Filters
//------------------------------------------------------------------------------

export default function EldritchInvocationsFilters() {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = eldritchInvocationsStore.useFilters();

  const [nameFilter, setNameFilter] = eldritchInvocationsStore.useNameFilter();
  const [tempNameFilter, setTempNameFilter] = useDebouncedState(
    nameFilter,
    setNameFilter,
    200
  );

  const orderOptions = useMemo(
    () =>
      createListCollection({
        items: orders.map((value) => ({ label: t(`order.${value}`), value })),
      }),
    [t]
  );

  return (
    <HStack>
      <Select
        minW="13.5em"
        onValueChange={(value) => {
          const [order_by, order_dir] = value.split(".") as [
            EldritchInvocationFilters["order_by"],
            EldritchInvocationFilters["order_dir"]
          ];
          setFilters({ order_by, order_dir });
        }}
        options={orderOptions}
        size="sm"
        value={`${filters.order_by}.${filters.order_dir}`}
      />

      <Separator h="1.5em" orientation="vertical" />

      <Input
        id="filter-eldritch-invocation-name"
        onValueChange={setTempNameFilter}
        placeholder={t("name")}
        size="sm"
        value={tempNameFilter}
      />

      <NumberInput
        onValueChange={(warlock_level) => setFilters({ warlock_level })}
        size="sm"
        value={filters.warlock_level ?? 20}
      />
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

  "name": {
    en: "Name",
    it: "Nome",
  },

  "types": {
    en: "Type",
    it: "Tipo",
  },
};
