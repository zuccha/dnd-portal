import { GridItem, SimpleGrid, Span, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { equipmentReferenceStore } from "~/models/resources/equipment/equipment-reference-store";
import { languageStore } from "~/models/resources/languages/language-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RichText from "~/ui/rich-text";
import RouterLink from "~/ui/router-link";
import ResourceDetailContent from "../../detail/resource-detail-content";
import ResourceDetailField from "../../detail/resource-detail-field";
import CreatureDetailAbilityScoreTable from "./creature-detail-ability-score-table";
import type { ResourceDetailLinkEntry } from "../../detail/resource-detail-links";
import type { ReactNode } from "react";

type CreatureDetailResource = ReturnType<typeof creatureStore.useLocalizedResource>;
const { useLocalizedResource: useLocalizedFamily } = creatureFamilyStore;
const { useLocalizedEquipmentEntries } = equipmentReferenceStore;
const { useLocalizedResourceNames: useLocalizedLanguageNames } = languageStore;
const noLanguageIds: string[] = [];

//------------------------------------------------------------------------------
// Creature Detail
//------------------------------------------------------------------------------

export default function CreatureDetail({ resource }: { resource: CreatureDetailResource }) {
  const { lang, t } = useI18nLangContext(i18nContext);
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

  if (!creature) return <ResourceDetailContent resource={creature} />;

  const hitPoints = [creature.hp, creature.hp_formula && `(${creature.hp_formula})`]
    .filter(Boolean)
    .join(" ");
  const experience =
    creature._raw.has_lair && creature.lair_exp !== creature.exp
      ? `${creature.exp} (${creature.lair_exp} ${t("lair")})`
      : creature.exp;

  return (
    <ResourceDetailContent
      detailsContent={
        <VStack align="stretch" gap={3}>
          <SimpleGrid columns={{ base: 1, md: 3 }} columnGap={6} rowGap={2}>
            {[
              [t("challenge_rating"), creature.cr],
              [t("proficiency_bonus"), creature.pb],
              [t("experience"), experience],
            ].map(([label, value], index) => (
              <ResourceDetailField key={index} label={label}>
                {value}
              </ResourceDetailField>
            ))}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} columnGap={6} rowGap={3}>
            {[
              [
                t("armor_class"),
                `${creature.ac}${creature._raw.armor_class_adds_spell_level ? " + X" : ""}`,
              ],
            ].map(([label, value], index) => (
              <ResourceDetailField key={index} label={label}>
                {value}
              </ResourceDetailField>
            ))}
            <GridItem colSpan={{ base: 1, md: family ? 1 : 2 }}>
              <ResourceDetailField label={t("hit_points")}>{hitPoints}</ResourceDetailField>
            </GridItem>
            {family && (
              <ResourceDetailField label={t("family")}>
                <RouterLink to={resourceDetailRoute("creature_family", familyId)}>
                  {family.name}
                </RouterLink>
              </ResourceDetailField>
            )}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} columnGap={6} rowGap={3}>
            {[[t("initiative"), `${creature.initiative} (${creature.initiative_passive})`]].map(
              ([label, value], index) => (
                <ResourceDetailField key={index} label={label}>
                  {value}
                </ResourceDetailField>
              ),
            )}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <ResourceDetailField label={t("passive_perception")}>
                {creature.perception_passive}
              </ResourceDetailField>
            </GridItem>
          </SimpleGrid>

          <ResourceDetailField label={t("speed")}>{creature.speed}</ResourceDetailField>

          <CreatureDetailAbilityScoreTable creature={creature} />

          {creature.info && (
            <RichText
              patterns={detailInfoRichTextPatterns}
              text={creature.info}
              whiteSpace="pre-wrap"
            />
          )}
        </VStack>
      }
      resource={creature}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  armor_class: { en: "Armor Class", it: "Classe Armatura" },
  challenge_rating: { en: "Challenge Rating", it: "Grado di Sfida" },
  experience: { en: "Experience Points", it: "Punti Esperienza" },
  family: { en: "Family", it: "Famiglia" },
  hit_points: { en: "Hit Points", it: "Punti Ferita" },
  initiative: { en: "Initiative", it: "Iniziativa" },
  lair: { en: "in lair", it: "nella tana" },
  passive_perception: { en: "Passive Perception", it: "Percezione passiva" },
  proficiency_bonus: { en: "Proficiency Bonus", it: "Bonus di Competenza" },
  speed: { en: "Speed", it: "Velocità" },
};

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
