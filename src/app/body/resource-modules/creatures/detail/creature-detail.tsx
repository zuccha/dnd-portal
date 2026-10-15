import { GridItem, SimpleGrid, Span, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { equipmentReferenceStore } from "~/models/resources/equipment/equipment-reference-store";
import { languageStore } from "~/models/resources/languages/language-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RichText from "~/ui/rich-text";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";
import ResourceDetailLinks from "../../resource-detail-links";
import CreatureDetailAbilityScoreTable from "./creature-detail-ability-score-table";
import type { ResourceDetailLinkEntry } from "../../resource-detail-links";
import type { ReactNode } from "react";

type CreatureDetailResource = ReturnType<typeof creatureStore.useLocalizedResource>;
const { useLocalizedResource: useLocalizedFamily } = creatureFamilyStore;
const { useLocalizedEquipmentEntries } = equipmentReferenceStore;
const { useLocalizedResourceNames: useLocalizedLanguageNames } = languageStore;
const noLanguageIds: string[] = [];

//------------------------------------------------------------------------------
// Creature Detail
//------------------------------------------------------------------------------

export default function CreatureDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: CreatureDetailResource;
}) {
  const [lang] = useI18nLang();
  const creature = resource;
  const familyId = creature?._raw.family_id ?? "";
  const family = useLocalizedFamily(familyId);
  const equipmentEntries = useLocalizedEquipmentEntries(lang);
  const languageIds = useMemo(
    () => creature?._raw.language_entries.map(({ language_id }) => language_id) ?? noLanguageIds,
    [creature],
  );
  const languageNames = useLocalizedLanguageNames(languageIds);
  const linkedResources = useMemo<ResourceDetailLinkEntry[]>(() => {
    const byId = new Map<string, ResourceDetailLinkEntry>();
    for (const { id } of creature?._raw.gear.equipments ?? []) {
      const equipment = equipmentEntries.find((entry) => entry.id === id);
      if (equipment) byId.set(`${equipment.kind}:${equipment.id}`, equipment);
    }
    languageIds.forEach((id, index) => {
      const name = languageNames[index];
      if (name) byId.set(`language:${id}`, { id, kind: "language", name });
    });

    return [...byId.values()].sort((a, b) => b.name.length - a.name.length);
  }, [creature, equipmentEntries, languageIds, languageNames]);
  const detailInfoRichTextPatterns = useMemo(() => {
    const idsByName = new Map<
      string,
      { id: string; kind: (typeof linkedResources)[number]["kind"] }[]
    >();
    for (const { id, kind, name } of linkedResources) {
      idsByName.set(name, [...(idsByName.get(name) ?? []), { id, kind }]);
    }
    const uniqueNames = [...idsByName]
      .filter(([, entries]) => entries.length === 1)
      .map(([name]) => name)
      .sort((a, b) => b.length - a.length);
    const linkPattern = uniqueNames.length
      ? {
          regex: new RegExp(`(${uniqueNames.map(escapeRegExp).join("|")})`),
          render: (value: ReactNode) => {
            if (typeof value !== "string") return value;
            const [entry] = idsByName.get(value) ?? [];
            return entry ? (
              <RouterLink to={resourceDetailRoute(entry.kind, entry.id)}>{value}</RouterLink>
            ) : (
              value
            );
          },
        }
      : undefined;

    return linkPattern
      ? [...creatureInfoRichTextPatterns, linkPattern]
      : creatureInfoRichTextPatterns;
  }, [linkedResources]);

  return (
    <ResourceDetail actions={actions} resource={creature}>
      {creature && (
        <VStack align="stretch" gap={3}>
          <SimpleGrid columns={{ base: 1, md: 3 }} columnGap={6} rowGap={2}>
            <ResourceDetailField label={creature.challengeRating.label}>
              {creature.challengeRating.value}
            </ResourceDetailField>
            <ResourceDetailField label={creature.proficiencyBonus.label}>
              {creature.proficiencyBonus.value}
            </ResourceDetailField>
            <ResourceDetailField label={creature.experience.label}>
              {creature.experience.valueWithLair}
            </ResourceDetailField>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} columnGap={6} rowGap={3}>
            <ResourceDetailField label={creature.armorClass.label}>
              {creature.armorClass.valueWithSpellLevel}
            </ResourceDetailField>
            <ResourceDetailField label={creature.hitPoints.label}>
              {creature.hitPoints.valueWithFormula}
            </ResourceDetailField>
            <ResourceDetailField label={creature.initiative.label}>
              {creature.initiative.value} ({creature.initiative.passive})
            </ResourceDetailField>

            <ResourceDetailField label={creature.passivePerception.label}>
              {creature.passivePerception.value}
            </ResourceDetailField>
            <GridItem gridColumn={{ base: 1, md: 2 }}>
              {family && (
                <ResourceDetailField label={creature.familyLabel}>
                  <RouterLink to={resourceDetailRoute("creature_family", familyId)}>
                    {family.name}
                  </RouterLink>
                </ResourceDetailField>
              )}
            </GridItem>
            <GridItem gridColumn={{ base: 1, md: 3 }}>
              {creature.tags.resources.length > 0 && (
                <ResourceDetailField label={creature.tags.label}>
                  <ResourceDetailLinks resources={creature.tags.resources} />
                </ResourceDetailField>
              )}
            </GridItem>
          </SimpleGrid>

          <ResourceDetailField label={creature.speed.label}>
            {creature.speed.value}
          </ResourceDetailField>

          <CreatureDetailAbilityScoreTable creature={creature} />

          {creature.info && (
            <RichText
              patterns={detailInfoRichTextPatterns}
              text={creature.info}
              whiteSpace="pre-wrap"
            />
          )}
        </VStack>
      )}
    </ResourceDetail>
  );
}

//------------------------------------------------------------------------------
// Creature Info Rich Text Patterns
//------------------------------------------------------------------------------

const creatureInfoRichTextPatterns = [
  {
    regex: /\*\*(.+?)\*\*/,
    render: (value: ReactNode) => (
      <Span color="fg.muted" fontSize="sm" fontWeight="medium">
        {value}
      </Span>
    ),
  },
  ...RichText.defaultPatterns.slice(1),
];

//------------------------------------------------------------------------------
// Escape Regular Expression
//------------------------------------------------------------------------------

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
