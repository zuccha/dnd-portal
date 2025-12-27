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
import { type ToolFilters } from "~/models/resources/equipment/tools/tool";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { useCreatureAbilityOptions } from "~/models/types/creature-ability";
import { useToolTypeOptions } from "~/models/types/tool-type";
import Icon from "~/ui/icon";
import InclusionButton from "~/ui/inclusion-button";
import InclusionSelect from "~/ui/inclusion-select";
import Input from "~/ui/input";
import Select from "~/ui/select";

//------------------------------------------------------------------------------
// Tools Filters
//------------------------------------------------------------------------------

export default function ToolsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = toolStore.useFilters();

  const [tempNameFilter, setTempNameFilter] = useDebouncedState(
    filters.name,
    useCallback((name) => setFilters({ name }), [setFilters]),
    200,
  );

  const abilityOptions = useCreatureAbilityOptions();
  const typeOptions = useToolTypeOptions();

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
            ToolFilters["order_by"],
            ToolFilters["order_dir"],
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
        id="filter-tool-name"
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
        includes={filters.abilities ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ abilities: { ...filters.abilities, ...partial } })
        }
        options={abilityOptions}
        size="sm"
      >
        {t("abilities")}
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
  "abilities": {
    en: "Abilities",
    it: "Abilità",
  },
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
    en: "Types",
    it: "Tipi",
  },
};
