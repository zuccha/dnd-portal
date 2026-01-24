import { type StackProps } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import { useItemTypeOptions } from "~/models/types/item-type";
import InclusionSelect from "~/ui/inclusion-select";
import EquipmentFilters from "../equipment-filters";

//------------------------------------------------------------------------------
// Items Filters
//------------------------------------------------------------------------------

export default function ItemsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = itemStore.useFilters();

  const typeOptions = useItemTypeOptions();

  return (
    <EquipmentFilters filters={filters} onFiltersChange={setFilters} {...props}>
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
    </EquipmentFilters>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  types: {
    en: "Type",
    it: "Tipo",
  },
};
