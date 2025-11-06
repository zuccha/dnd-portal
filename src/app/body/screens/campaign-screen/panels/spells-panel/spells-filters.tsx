import { HStack, Separator, createListCollection } from "@chakra-ui/react";
import { useMemo } from "react";
import useDebouncedState from "../../../../../../hooks/use-debounced-value";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { type SpellFilters } from "../../../../../../resources/spell";
import { spellsStore } from "../../../../../../resources/spells-store";
import { useCharacterClassOptions } from "../../../../../../resources/types/character-class";
import { useSpellLevelOptions } from "../../../../../../resources/types/spell-level";
import { useSpellSchoolOptions } from "../../../../../../resources/types/spell-school";
import InclusionButton from "../../../../../../ui/inclusion-button";
import InclusionSelect from "../../../../../../ui/inclusion-select";
import Input from "../../../../../../ui/input";
import Select from "../../../../../../ui/select";

//------------------------------------------------------------------------------
// Spells Filters
//------------------------------------------------------------------------------

export default function SpellsFilters() {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = spellsStore.useFilters();

  const [nameFilter, setNameFilter] = spellsStore.useNameFilter();
  const [tempNameFilter, setTempNameFilter] = useDebouncedState(
    nameFilter,
    setNameFilter,
    200
  );

  const orderOptions = useMemo(
    () =>
      createListCollection({
        items: orders.map((value) => ({ label: t(`order.${value}`), value })),
      }),
    [t]
  );

  const levelOptions = useSpellLevelOptions();
  const characterClassOptions = useCharacterClassOptions();
  const schoolOptions = useSpellSchoolOptions();

  return (
    <HStack>
      <Select
        minW="13.5em"
        onValueChange={(value) => {
          const [order_by, order_dir] = value.split(".") as [
            SpellFilters["order_by"],
            SpellFilters["order_dir"]
          ];
          setFilters({ order_by, order_dir });
        }}
        options={orderOptions}
        size="sm"
        value={`${filters.order_by}.${filters.order_dir}`}
      />

      <Separator h="1.5em" orientation="vertical" />

      <Input
        id="filter-spell-name"
        onValueChange={setTempNameFilter}
        placeholder={t("name")}
        size="sm"
        value={tempNameFilter}
        w="15em"
      />

      <InclusionSelect
        includes={filters.levels ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ levels: { ...filters.levels, ...partial } })
        }
        options={levelOptions}
        size="sm"
      >
        {t("levels")}
      </InclusionSelect>

      <InclusionSelect
        includes={filters.character_classes ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({
            character_classes: { ...filters.character_classes, ...partial },
          })
        }
        options={characterClassOptions}
        size="sm"
      >
        {t("character_classes")}
      </InclusionSelect>

      <InclusionSelect
        includes={filters.schools ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ schools: { ...filters.schools, ...partial } })
        }
        options={schoolOptions}
        size="sm"
      >
        {t("schools")}
      </InclusionSelect>

      <InclusionButton
        include={filters.ritual}
        onValueChange={(ritual) => setFilters({ ritual })}
        size="sm"
      >
        {t("ritual")}
      </InclusionButton>

      <InclusionButton
        include={filters.concentration}
        onValueChange={(concentration) => setFilters({ concentration })}
        size="sm"
      >
        {t("concentration")}
      </InclusionButton>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Orders
//------------------------------------------------------------------------------

const orders = ["name.asc", "name.desc", "level.asc", "level.desc"];

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

  "order.level.asc": {
    en: "Sort by Level (0-9)",
    it: "Ordina per Livello (0-9)",
  },

  "order.level.desc": {
    en: "Sort by Level (9-0)",
    it: "Ordina per Livello (9-0)",
  },

  "name": {
    en: "Name",
    it: "Nome",
  },

  "levels": {
    en: "Levels",
    it: "Livelli",
  },

  "character_classes": {
    en: "Classes",
    it: "Classi",
  },

  "schools": {
    en: "Schools",
    it: "Scuole",
  },

  "concentration": {
    en: "C",
    it: "C",
  },

  "ritual": {
    en: "R",
    it: "R",
  },
};
