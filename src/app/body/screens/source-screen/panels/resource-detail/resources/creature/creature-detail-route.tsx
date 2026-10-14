import { GridItem, SimpleGrid, Span, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import RichText from "~/ui/rich-text";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";
import CreatureDetailAbilityScoreTable from "./creature-detail-ability-score-table";
import type { ReactNode } from "react";

const useLocalizedResource = creatureStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Creature Detail Route
//------------------------------------------------------------------------------

export default function CreatureDetailRoute({ resourceId }: { resourceId: string }) {
  const { t } = useI18nLangContext(i18nContext);
  const creature = useLocalizedResource(resourceId);

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
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <ResourceDetailField label={t("hit_points")}>{hitPoints}</ResourceDetailField>
            </GridItem>
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
              patterns={creatureInfoRichTextPatterns}
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
