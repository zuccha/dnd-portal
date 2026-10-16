import { Box, GridItem, SimpleGrid, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { defaultCharacterClass } from "~/models/resources/character-classes/character-class";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { spellStore } from "~/models/resources/spells/spell-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";
import ResourceDetailLinks from "../../resource-detail-links";

type CharacterClassDetailResource = ReturnType<typeof characterClassStore.useLocalizedResource>;
const { useRelatedEntries: useCharacterClassRelatedEntries } = characterClassStore;
const {
  useLocalizedResourceNames: useLocalizedSubclassNames,
  useResourceIds: useSubclassResourceIds,
  useResources: useSubclassResources,
} = characterSubclassStore;
const { useLocalizedResourceNames: useLocalizedToolNames } = toolStore;
const { useLocalizedResourceNames: useLocalizedSpellNames, useResources: useSpellResources } =
  spellStore;
const noToolIds: string[] = [];

//------------------------------------------------------------------------------
// Character Class Detail
//------------------------------------------------------------------------------

export default function CharacterClassDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: CharacterClassDetailResource;
}) {
  const { lang, t, tpi } = useI18nLangContext(i18nContext);
  const characterClass = resource;
  const spellEntries = useCharacterClassRelatedEntries(
    characterClass?._raw.id ?? defaultCharacterClass.id,
    "spells",
  );
  const spellIds = spellEntries.map(({ id }) => id);
  const spellNames = useLocalizedSpellNames(spellIds);
  const spellResources = useSpellResources(spellIds);
  const spellLevelsById = new Map(spellResources.map(({ id, level }) => [id, level]));
  const spells = spellEntries.flatMap((entry, index) => {
    const name = spellNames[index];
    const level = spellLevelsById.get(entry.id);
    return name && level !== undefined ? [{ ...entry, level, name }] : [];
  });
  const spellGroups = [...new Set(spells.map(({ level }) => level))]
    .sort((a, b) => a - b)
    .map((level) => ({
      level,
      spells: spells
        .filter((spell) => spell.level === level)
        .sort((a, b) => a.name.localeCompare(b.name, lang)),
    }));
  const toolIds = characterClass?._raw.tool_proficiency_ids ?? noToolIds;
  const toolNames = useLocalizedToolNames(toolIds);
  const localizedTools = toolIds.flatMap((id, index) => {
    const name = toolNames[index];
    return name ? [{ id, kind: "tool" as const, name }] : [];
  });
  const subclassIds = useSubclassResourceIds(characterClass?.sourceId ?? "");
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
        characterClass.hitDie,
        characterClass.primaryAbilities,
        characterClass.savingThrowProficiencies,
        characterClass.armorProficiencies,
        characterClass.weaponProficiencies,
      ].filter(({ value }) => Boolean(value))
    : [];

  return (
    <ResourceDetail
      actions={actions}
      afterDescription={
        spells.length > 0 && (
          <VStack align="stretch" gap={2}>
            {spellGroups.map(({ level, spells: levelSpells }) => (
              <ResourceDetailField
                key={level}
                label={level === 0 ? t("cantrips") : tpi("spell_level", level, `${level}`)}
              >
                <Box>
                  <ResourceDetailLinks resources={levelSpells} />
                </Box>
              </ResourceDetailField>
            ))}
          </VStack>
        )
      }
      resource={characterClass}
    >
      {characterClass && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          {fields.map(({ label, value }) => (
            <ResourceDetailField key={label} label={label}>
              {value}
            </ResourceDetailField>
          ))}
          {localizedTools.length > 0 && (
            <ResourceDetailField label={characterClass.toolProficiencies.label}>
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
      )}
    </ResourceDetail>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "cantrips": { en: "Cantrips", it: "Trucchetti" },
  "spell_level/*": { en: "Level <1>", it: "Livello <1>" },
  "subclasses": { en: "Subclasses", it: "Sottoclassi" },
};
