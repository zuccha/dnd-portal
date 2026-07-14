import { type StackProps } from "@chakra-ui/react";
import { FlaskConicalIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import { useItemTypeOptions } from "~/models/types/item-type";
import CaptionInput from "~/ui/caption-input";
import Icon from "~/ui/icon";
import InclusionButton from "~/ui/inclusion-button";
import InclusionSelect from "~/ui/inclusion-select";
import NumberInput from "~/ui/number-input";
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
      <InclusionButton
        include={filters.consumable}
        onValueChange={(consumable) => setFilters({ consumable })}
        size="sm"
        w="full"
      >
        <Icon Icon={FlaskConicalIcon} size="sm" /> {t("consumable")}
      </InclusionButton>

      <CaptionInput caption={t("charges_min")} w="full">
        <NumberInput
          min={0}
          onValueChange={(charges_min) => setFilters({ charges_min })}
          size="sm"
          value={filters.charges_min}
          w="full"
        />
      </CaptionInput>

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
    </EquipmentFilters>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  charges_min: {
    en: "Minimum Charges",
    it: "Cariche Minime",
  },
  consumable: {
    en: "Consumable",
    it: "Consumabile",
  },
  types: {
    en: "Type",
    it: "Tipo",
  },
};
