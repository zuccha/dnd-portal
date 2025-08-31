import { HStack, Separator, createListCollection } from "@chakra-ui/react";
import { BowArrowIcon, SwordsIcon, WandIcon } from "lucide-react";
import { useMemo } from "react";
import useDebouncedState from "../../../../../../hooks/use-debounced-value";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import {
  type WeaponFilters,
  useWeaponFilters,
  useWeaponNameFilter,
} from "../../../../../../resources/weapon";
import { useWeaponMasteryTranslations } from "../../../../../../resources/weapon-mastery";
import { useWeaponPropertyTranslations } from "../../../../../../resources/weapon-property";
import { useWeaponTypeTranslations } from "../../../../../../resources/weapon-type";
import Icon from "../../../../../../ui/icon";
import InclusionButton from "../../../../../../ui/inclusion-button";
import InclusionSelect from "../../../../../../ui/inclusion-select";
import Input from "../../../../../../ui/input";
import Select from "../../../../../../ui/select";

//------------------------------------------------------------------------------
// Weapons Filters
//------------------------------------------------------------------------------

export default function WeaponsFilters() {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = useWeaponFilters();

  const [nameFilter, setNameFilter] = useWeaponNameFilter();
  const [tempNameFilter, setTempNameFilter] = useDebouncedState(
    nameFilter,
    setNameFilter,
    200
  );

  const weaponMasteryTranslations = useWeaponMasteryTranslations();
  const weaponPropertyTranslations = useWeaponPropertyTranslations();
  const weaponTypeTranslations = useWeaponTypeTranslations();

  const orderOptions = useMemo(
    () =>
      createListCollection({
        items: orders.map((value) => ({ label: t(`order.${value}`), value })),
      }),
    [t]
  );

  const typeOptions = useMemo(
    () =>
      weaponTypeTranslations.map(({ label, weapon_type }) => ({
        label,
        value: weapon_type,
      })),
    [weaponTypeTranslations]
  );

  const propertyOptions = useMemo(
    () =>
      weaponPropertyTranslations.map(({ label, weapon_property }) => ({
        label,
        value: weapon_property,
      })),
    [weaponPropertyTranslations]
  );

  const masteryOptions = useMemo(
    () =>
      weaponMasteryTranslations.map(({ label, weapon_mastery }) => ({
        label,
        value: weapon_mastery,
      })),
    [weaponMasteryTranslations]
  );

  return (
    <HStack>
      <Select
        minW="13.5em"
        onValueChange={(value) => {
          const [order_by, order_dir] = value.split(".") as [
            WeaponFilters["order_by"],
            WeaponFilters["order_dir"]
          ];
          setFilters({ order_by, order_dir });
        }}
        options={orderOptions}
        size="sm"
        value={`${filters.order_by}.${filters.order_dir}`}
      />

      <Separator h="1.5em" orientation="vertical" />

      <Input
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
        include={filters.magic}
        onValueChange={(magic) => setFilters({ magic })}
        size="sm"
      >
        <Icon Icon={WandIcon} size="sm" />
      </InclusionButton>

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

  "properties": {
    en: "Properties",
    it: "Proprietà",
  },

  "masteries": {
    en: "Masteries",
    it: "Padronanze",
  },

  "magic": {
    en: "🪄",
    it: "🪄",
  },

  "melee": {
    en: "⚔️",
    it: "⚔️",
  },

  "ranged": {
    en: "🏹",
    it: "🏹",
  },
};
