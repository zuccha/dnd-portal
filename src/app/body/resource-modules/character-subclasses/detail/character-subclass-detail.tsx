import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";

type CharacterSubclassDetailResource = ReturnType<
  typeof characterSubclassStore.useLocalizedResource
>;
const { useLocalizedResource: useLocalizedCharacterClass } = characterClassStore;

//------------------------------------------------------------------------------
// Character Subclass Detail
//------------------------------------------------------------------------------

export default function CharacterSubclassDetail({
  resource,
}: {
  resource: CharacterSubclassDetailResource;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const characterSubclass = resource;
  const classId = characterSubclass?._raw.character_class_id ?? "";
  const characterClass = useLocalizedCharacterClass(classId);

  return (
    <ResourceDetailContent
      detailsContent={
        characterClass && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
            <ResourceDetailField label={t("character_class")}>
              <RouterLink to={resourceDetailRoute("character_class", classId)}>
                {characterClass.name}
              </RouterLink>
            </ResourceDetailField>
          </SimpleGrid>
        )
      }
      resource={characterSubclass}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  character_class: { en: "Class", it: "Classe" },
};
