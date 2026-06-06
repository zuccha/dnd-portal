import { type StackProps } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import { useArmorTypeOptions } from "~/models/types/armor-type";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";
import EquipmentFilters from "../equipment-filters";

//------------------------------------------------------------------------------
// Armors Filters
//------------------------------------------------------------------------------

export default function ArmorsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = armorStore.useFilters();

  const typeOptions = useArmorTypeOptions();

  return (
    <EquipmentFilters filters={filters} onFiltersChange={setFilters} {...props}>
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
