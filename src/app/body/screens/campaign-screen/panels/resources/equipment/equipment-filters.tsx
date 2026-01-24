import { HStack, type StackProps } from "@chakra-ui/react";
import { WandIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { EquipmentFilters } from "~/models/resources/equipment/equipment-filters";
import { useEquipmentRarityOptions } from "~/models/types/equipment-rarity";
import Icon from "~/ui/icon";
import InclusionButton from "~/ui/inclusion-button";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Equipment Filters
//------------------------------------------------------------------------------

export type EquipmentFiltersProps = StackProps & {
  filters: EquipmentFilters;
  onFiltersChange: (partialFilters: Partial<EquipmentFilters>) => void;
};

export default function EquipmentFilters({
  children,
  filters,
  onFiltersChange,
  ...rest
}: EquipmentFiltersProps) {
  const { t } = useI18nLangContext(i18nContext);

  const rarityOptions = useEquipmentRarityOptions();

  return (
    <HStack {...rest}>
      <InclusionButton
        include={filters.magic}
        onValueChange={(magic) => onFiltersChange({ magic })}
        size="sm"
      >
        <Icon Icon={WandIcon} size="sm" />
      </InclusionButton>

      <InclusionSelect
        includes={filters.rarities ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          onFiltersChange({ rarities: { ...filters.rarities, ...partial } })
        }
        options={rarityOptions}
        size="sm"
      >
        {t("rarity")}
      </InclusionSelect>

      {children}
    </HStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  rarity: {
    en: "Rarity",
    it: "Rarità",
  },
  types: {
    en: "Type",
    it: "Tipo",
  },
};
