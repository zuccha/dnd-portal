import { GridItem, SimpleGrid, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";
import ResourceDetailLinks from "../../resource-detail-links";

type CharacterClassDetailResource = ReturnType<typeof characterClassStore.useLocalizedResource>;
const {
  useLocalizedResourceNames: useLocalizedSubclassNames,
  useResourceIds: useSubclassResourceIds,
  useResources: useSubclassResources,
} = characterSubclassStore;
const { useLocalizedResourceNames: useLocalizedToolNames } = toolStore;
const noToolIds: string[] = [];

//------------------------------------------------------------------------------
// Character Class Detail
//------------------------------------------------------------------------------

export default function CharacterClassDetail({
  resource,
}: {
  resource: CharacterClassDetailResource;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const characterClass = resource;
  const toolIds = characterClass?._raw.tool_proficiency_ids ?? noToolIds;
  const toolNames = useLocalizedToolNames(toolIds);
  const localizedTools = toolIds.flatMap((id, index) => {
    const name = toolNames[index];
    return name ? [{ id, kind: "tool" as const, name }] : [];
  });
  const subclassIds = useSubclassResourceIds(characterClass?._raw.source_id ?? "");
  const subclasses = useSubclassResources(subclassIds);
  const classSubclassIds = subclasses
    .filter(({ character_class_id }) => character_class_id === characterClass?._raw.id)
    .map(({ id }) => id);
  const subclassNames = useLocalizedSubclassNames(classSubclassIds);
  const sortedSubclasses = classSubclassIds
    .flatMap((id, index) => {
      const name = subclassNames[index];
      return name ? [{ id, name }] : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const fields = characterClass
    ? [
        { label: t("hit_die"), value: characterClass.hp_die },
        { label: t("primary_abilities"), value: characterClass.primary_abilities },
        { label: t("saving_throws"), value: characterClass.saving_throw_proficiencies },
        { label: t("armor_proficiencies"), value: characterClass.armor_proficiencies },
        { label: t("weapon_proficiencies"), value: characterClass.weapon_proficiencies },
      ].filter(({ value }) => Boolean(value))
    : [];

  return (
    <ResourceDetailContent
      detailsContent={
        characterClass && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
            {fields.map(({ label, value }) => (
              <ResourceDetailField key={label} label={label}>
                {value}
              </ResourceDetailField>
            ))}
            {localizedTools.length > 0 && (
              <ResourceDetailField label={t("tool_proficiencies")}>
                <ResourceDetailLinks resources={localizedTools} />
              </ResourceDetailField>
            )}
            {sortedSubclasses.length > 0 && (
              <GridItem colSpan={{ base: 1, sm: 2 }}>
                <ResourceDetailField label={t("subclasses")}>
                  <VStack align="flex-start" gap={1}>
                    {sortedSubclasses.map(({ id, name }) => (
                      <RouterLink key={id} to={resourceDetailRoute("character_subclass", id)}>
                        {name}
                      </RouterLink>
                    ))}
                  </VStack>
                </ResourceDetailField>
              </GridItem>
            )}
          </SimpleGrid>
        )
      }
      resource={characterClass}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  armor_proficiencies: {
    en: "Armor Proficiencies",
    it: "Competenze nelle Armature",
  },
  hit_die: {
    en: "Hit Die",
    it: "Dado Vita",
  },
  primary_abilities: {
    en: "Primary Abilities",
    it: "Abilità Primarie",
  },
  saving_throws: {
    en: "Saving Throws",
    it: "Tiri Salvezza",
  },
  subclasses: { en: "Subclasses", it: "Sottoclassi" },
  tool_proficiencies: {
    en: "Tool Proficiencies",
    it: "Competenze negli Strumenti",
  },
  weapon_proficiencies: {
    en: "Weapon Proficiencies",
    it: "Competenze nelle Armi",
  },
};
