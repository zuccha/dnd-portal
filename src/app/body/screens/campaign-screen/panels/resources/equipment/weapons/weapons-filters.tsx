import { type StackProps } from "@chakra-ui/react";
import { BowArrowIcon, SwordsIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import { useWeaponMasteryOptions } from "~/models/types/weapon-mastery";
import { useWeaponPropertyOptions } from "~/models/types/weapon-property";
import { useWeaponTypeOptions } from "~/models/types/weapon-type";
import Icon from "~/ui/icon";
import InclusionButton from "~/ui/inclusion-button";
import InclusionSelect from "~/ui/inclusion-select";
import EquipmentFilters from "../equipment-filters";

//------------------------------------------------------------------------------
// Weapons Filters
//------------------------------------------------------------------------------

export default function WeaponsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = weaponStore.useFilters();

  const typeOptions = useWeaponTypeOptions();
  const propertyOptions = useWeaponPropertyOptions();
  const masteryOptions = useWeaponMasteryOptions();

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

      <InclusionSelect
        includes={filters.properties ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({
            properties: { ...filters.properties, ...partial },
          })
        }
        options={propertyOptions}
        size="sm"
      >
        {t("properties")}
      </InclusionSelect>

      <InclusionSelect
        includes={filters.masteries ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ masteries: { ...filters.masteries, ...partial } })
        }
        options={masteryOptions}
        size="sm"
      >
        {t("masteries")}
      </InclusionSelect>

      <InclusionButton
        include={filters.melee}
        onValueChange={(melee) => setFilters({ melee })}
        size="sm"
      >
        <Icon Icon={SwordsIcon} size="sm" />
      </InclusionButton>

      <InclusionButton
        include={filters.ranged}
        onValueChange={(ranged) => setFilters({ ranged })}
        size="sm"
      >
        <Icon Icon={BowArrowIcon} size="sm" />
      </InclusionButton>
    </EquipmentFilters>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  masteries: {
    en: "Masteries",
    it: "Padronanze",
  },
  properties: {
    en: "Properties",
    it: "Proprietà",
  },
  types: {
    en: "Type",
    it: "Tipo",
  },
};
