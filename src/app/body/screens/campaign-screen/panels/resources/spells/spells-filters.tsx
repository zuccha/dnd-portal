import { HStack, type StackProps } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { spellStore } from "~/models/resources/spells/spell-store";
import { useSpellCastingTimeOptions } from "~/models/types/spell-casting-time";
import {
  stringifySpellLevel,
  useSpellLevelOptions,
} from "~/models/types/spell-level";
import { useSpellSchoolOptions } from "~/models/types/spell-school";
import InclusionButton from "~/ui/inclusion-button";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Spells Filters
//------------------------------------------------------------------------------

export type SpellsFiltersProps = StackProps & {
  campaignId: string;
};

export default function SpellsFilters({
  campaignId,
  ...rest
}: SpellsFiltersProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = spellStore.useFilters();

  const levelOptions = useSpellLevelOptions();
  const stringifiedLevelOptions = useMemo(
    () =>
      levelOptions.map((o) => ({ ...o, value: stringifySpellLevel(o.value) })),
    [levelOptions],
  );

  const characterClassOptions =
    characterClassStore.useResourceOptions(campaignId);
  const schoolOptions = useSpellSchoolOptions();
  const castingTimeOptions = useSpellCastingTimeOptions();

  return (
    <HStack {...rest}>
      <InclusionSelect
        includes={filters.levels ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ levels: { ...filters.levels, ...partial } })
        }
        options={stringifiedLevelOptions}
        size="sm"
      >
        {t("levels")}
      </InclusionSelect>

      <InclusionSelect
        includes={filters.character_class_ids ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({
            character_class_ids: { ...filters.character_class_ids, ...partial },
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

      <InclusionSelect
        includes={filters.casting_time ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ casting_time: { ...filters.casting_time, ...partial } })
        }
        options={castingTimeOptions}
        size="sm"
      >
        {t("casting_time")}
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
  casting_time: {
    en: "Casting Time",
    it: "Tempo di Lancio",
  },
  character_classes: {
    en: "Classes",
    it: "Classi",
  },
  concentration: {
    en: "C",
    it: "C",
  },
  levels: {
    en: "Levels",
    it: "Livelli",
  },
  ritual: {
    en: "R",
    it: "R",
  },
  schools: {
    en: "Schools",
    it: "Scuole",
  },
};
