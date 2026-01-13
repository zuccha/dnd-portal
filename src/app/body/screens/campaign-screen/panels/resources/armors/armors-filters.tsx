import { HStack, type StackProps } from "@chakra-ui/react";
import { WandIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import { useArmorTypeOptions } from "~/models/types/armor-type";
import { useEquipmentRarityOptions } from "~/models/types/equipment-rarity";
import Icon from "~/ui/icon";
import InclusionButton from "~/ui/inclusion-button";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Armors Filters
//------------------------------------------------------------------------------

export default function ArmorsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = armorStore.useFilters();

  const typeOptions = useArmorTypeOptions();
  const rarityOptions = useEquipmentRarityOptions();

  return (
    <HStack {...props}>
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
        includes={filters.rarities ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ rarities: { ...filters.rarities, ...partial } })
        }
        options={rarityOptions}
        size="sm"
      >
        {t("rarity")}
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
