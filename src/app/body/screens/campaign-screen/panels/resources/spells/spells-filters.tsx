import { type StackProps, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import ConcentrationIcon from "~/icons/concentration-icon";
import RitualIcon from "~/icons/ritual-icon";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { spellStore } from "~/models/resources/spells/spell-store";
import { useSpellCastingTimeOptions } from "~/models/types/spell-casting-time";
import {
  stringifySpellLevel,
  useSpellLevelOptions,
} from "~/models/types/spell-level";
import { useSpellSchoolOptions } from "~/models/types/spell-school";
import CaptionInput from "~/ui/caption-input";
import Icon from "~/ui/icon";
import InclusionButton from "~/ui/inclusion-button";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Spells Filters
//------------------------------------------------------------------------------

export type SpellsFiltersProps = StackProps & {
  sourceId: string;
};

export default function SpellsFilters({
  sourceId,
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
    characterClassStore.useResourceOptions(sourceId);
  const schoolOptions = useSpellSchoolOptions();
  const castingTimeOptions = useSpellCastingTimeOptions();

  return (
    <VStack {...rest}>
      <CaptionInput caption={t("levels")} w="full">
        <InclusionSelect
          includes={filters.levels ?? {}}
          onValueChange={(partial) =>
            setFilters({ levels: { ...filters.levels, ...partial } })
          }
          options={stringifiedLevelOptions}
          size="sm"
          w="full"
        >
          {t("levels")}
        </InclusionSelect>
      </CaptionInput>

      <CaptionInput caption={t("character_classes")} w="full">
        <InclusionSelect
          includes={filters.character_class_ids ?? {}}
          onValueChange={(partial) =>
            setFilters({
              character_class_ids: {
                ...filters.character_class_ids,
                ...partial,
              },
            })
          }
          options={characterClassOptions}
          size="sm"
          w="full"
        >
          {t("character_classes")}
        </InclusionSelect>
      </CaptionInput>

      <CaptionInput caption={t("schools")} w="full">
        <InclusionSelect
          includes={filters.schools ?? {}}
          onValueChange={(partial) =>
            setFilters({ schools: { ...filters.schools, ...partial } })
          }
          options={schoolOptions}
          size="sm"
          w="full"
        >
          {t("schools")}
        </InclusionSelect>
      </CaptionInput>

      <CaptionInput caption={t("casting_time")} w="full">
        <InclusionSelect
          includes={filters.casting_time ?? {}}
          onValueChange={(partial) =>
            setFilters({
              casting_time: { ...filters.casting_time, ...partial },
            })
          }
          options={castingTimeOptions}
          size="sm"
          w="full"
        >
          {t("casting_time")}
        </InclusionSelect>
      </CaptionInput>

      <InclusionButton
        include={filters.ritual}
        onValueChange={(ritual) => setFilters({ ritual })}
        size="sm"
        w="full"
      >
        <Icon Icon={RitualIcon} size="sm" /> {t("ritual")}
      </InclusionButton>

      <InclusionButton
        include={filters.concentration}
        onValueChange={(concentration) => setFilters({ concentration })}
        size="sm"
        w="full"
      >
        <Icon Icon={ConcentrationIcon} size="sm" /> {t("concentration")}
      </InclusionButton>
    </VStack>
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
    en: "Concentration",
    it: "Concentrazione",
  },
  levels: {
    en: "Levels",
    it: "Livelli",
  },
  ritual: {
    en: "Ritual",
    it: "Rituale",
  },
  schools: {
    en: "Schools",
    it: "Scuole",
  },
};
