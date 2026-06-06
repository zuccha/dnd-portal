import { type StackProps, VStack } from "@chakra-ui/react";
import { WandIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { EquipmentFilters } from "~/models/resources/equipment/equipment-filters";
import { useEquipmentRarityOptions } from "~/models/types/equipment-rarity";
import CaptionInput from "~/ui/caption-input";
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
    <VStack {...rest}>
      <InclusionButton
        include={filters.magic}
        onValueChange={(magic) => onFiltersChange({ magic })}
        size="sm"
        w="full"
      >
        <Icon Icon={WandIcon} size="sm" /> {t("magic")}
      </InclusionButton>

      <CaptionInput caption={t("rarity")} w="full">
        <InclusionSelect
          includes={filters.rarities ?? {}}
          onValueChange={(partial) =>
            onFiltersChange({ rarities: { ...filters.rarities, ...partial } })
          }
          options={rarityOptions}
          placeholder={t("rarity")}
          size="sm"
          w="full"
        />
      </CaptionInput>

      {children}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  magic: {
    en: "Magic",
    it: "Magico",
  },
  rarity: {
    en: "Rarity",
    it: "Rarità",
  },
};
