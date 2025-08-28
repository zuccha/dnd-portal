import { HStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { useCharacterClassesTranslations } from "../../../../../../resources/character-class-translation";
import {
  useSpellFilters,
  useSpellNameFilter,
} from "../../../../../../resources/spell";
import { spellLevels } from "../../../../../../resources/spell-level";
import { useSpellSchoolTranslations } from "../../../../../../resources/spell-school-translation";
import InclusionButton from "../../../../../../ui/inclusion-button";
import InclusionSelect from "../../../../../../ui/inclusion-select";
import Input from "../../../../../../ui/input";
import { compareObjects } from "../../../../../../utils/object";

//------------------------------------------------------------------------------
// Spells Filters
//------------------------------------------------------------------------------

export default function SpellsFilters() {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = useSpellFilters();
  const [nameFilter, setNameFilter] = useSpellNameFilter();

  const characterClassTranslations = useCharacterClassesTranslations();
  const spellSchoolTranslations = useSpellSchoolTranslations();

  const levelOptions = useMemo(
    () =>
      spellLevels.map((level) => ({ label: `${level}`, value: `${level}` })),
    []
  );

  const characterClassOptions = useMemo(
    () =>
      characterClassTranslations
        .map(({ character_class, label }) => ({
          label,
          value: character_class,
        }))
        .sort(compareObjects("label")),
    [characterClassTranslations]
  );

  const spellSchoolOptions = useMemo(
    () =>
      spellSchoolTranslations
        .map(({ spell_school, label }) => ({ label, value: spell_school }))
        .sort(compareObjects("label")),
    [spellSchoolTranslations]
  );

  return (
    <HStack>
      <Input
        onValueChange={setNameFilter}
        placeholder={t("name")}
        size="sm"
        value={nameFilter}
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
        options={spellSchoolOptions}
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
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  name: {
    en: "Name",
    it: "Nome",
  },

  levels: {
    en: "Levels",
    it: "Livelli",
  },

  character_classes: {
    en: "Classes",
    it: "Classi",
  },

  schools: {
    en: "Schools",
    it: "Scuole",
  },

  concentration: {
    en: "C",
    it: "C",
  },

  ritual: {
    en: "R",
    it: "R",
  },
};
