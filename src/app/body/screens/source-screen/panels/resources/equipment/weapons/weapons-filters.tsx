import { type StackProps } from "@chakra-ui/react";
import { BowArrowIcon, SwordsIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import { useWeaponMasteryOptions } from "~/models/types/weapon-mastery";
import { useWeaponPropertyOptions } from "~/models/types/weapon-property";
import { useWeaponTypeOptions } from "~/models/types/weapon-type";
import CaptionInput from "~/ui/caption-input";
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

      <CaptionInput caption={t("properties")} w="full">
        <InclusionSelect
          includes={filters.properties ?? {}}
          onValueChange={(partial) =>
            setFilters({
              properties: { ...filters.properties, ...partial },
            })
          }
          options={propertyOptions}
          placeholder={t("properties")}
          size="sm"
          w="full"
        />
      </CaptionInput>

      <CaptionInput caption={t("masteries")} w="full">
        <InclusionSelect
          includes={filters.masteries ?? {}}
          onValueChange={(partial) =>
            setFilters({ masteries: { ...filters.masteries, ...partial } })
          }
          options={masteryOptions}
          placeholder={t("masteries")}
          size="sm"
          w="full"
        />
      </CaptionInput>

      <InclusionButton
        include={filters.melee}
        onValueChange={(melee) => setFilters({ melee })}
        size="sm"
        w="full"
      >
        <Icon Icon={SwordsIcon} size="sm" /> {t("melee")}
      </InclusionButton>

      <InclusionButton
        include={filters.ranged}
        onValueChange={(ranged) => setFilters({ ranged })}
        size="sm"
        w="full"
      >
        <Icon Icon={BowArrowIcon} size="sm" /> {t("ranged")}
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
  melee: {
    en: "Melee",
    it: "Da mischia",
  },
  properties: {
    en: "Properties",
    it: "Proprietà",
  },
  ranged: {
    en: "Ranged",
    it: "A distanza",
  },
  types: {
    en: "Type",
    it: "Tipo",
  },
};
