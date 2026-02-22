import { HStack, type StackProps } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Character Subclasses Filters
//------------------------------------------------------------------------------

export type CharacterSubclassesFiltersProps = StackProps & {
  sourceId: string;
};

export default function CharacterSubclassesFilters({
  sourceId,
  ...rest
}: CharacterSubclassesFiltersProps) {
  const { t } = useI18nLangContext(i18nContext);

  const characterClassOptions =
    characterClassStore.useResourceOptions(sourceId);

  const [filters, setFilters] = characterSubclassStore.useFilters();

  return (
    <HStack {...rest}>
      <InclusionSelect
        disabled={!characterClassOptions.length}
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
    </HStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  character_classes: {
    en: "Classes",
    it: "Classi",
  },
};
