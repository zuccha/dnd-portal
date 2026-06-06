import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import CaptionInput from "~/ui/caption-input";
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
    <VStack {...rest}>
      <CaptionInput caption={t("character_classes")} w="full">
        <InclusionSelect
          buttonProps={{ disabled: !characterClassOptions.length }}
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
          placeholder={t("character_classes")}
          size="sm"
          w="full"
        />
      </CaptionInput>
    </VStack>
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
