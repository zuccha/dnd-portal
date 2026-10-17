import { Box, GridItem, HStack, SimpleGrid, Span, VStack } from "@chakra-ui/react";
import { Fragment } from "react";
import { useCallback, useState } from "react";
import type { Creature } from "~/models/resources/creatures/creature";
import type { LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import PokerCard from "~/ui/poker-card";
import ResourceCardLink from "../../resource-card-link";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// Creature Card
//------------------------------------------------------------------------------

export type CreatureCardProps = Omit<
  ResourcePokerCardProps<Creature, LocalizedCreature>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function CreatureCard({
  localizedResource,
  linkResources = true,
  onPageCountChange = () => {},
  palette,
  ...rest
}: CreatureCardProps) {
  const [infoCompact, setInfoCompact] = useState(false);

  const handlePageCountChange = useCallback(
    (count: number | undefined, firstDetailsPageOverflow: boolean) => {
      onPageCountChange(count, firstDetailsPageOverflow);
      if (firstDetailsPageOverflow) setInfoCompact(true);
    },
    [onPageCountChange],
  );
  const fields = [
    localizedResource.skills,
    localizedResource.immunities,
    localizedResource.resistances,
    localizedResource.vulnerabilities,
    {
      ...localizedResource.gear,
      value: linkResources
        ? [
            ...localizedResource.gear.entries.map((entry, index) => (
              <Fragment key={`${entry.resource?.kind}:${entry.resource?.id}:${index}`}>
                {index > 0 && ", "}
                {entry.resource ? (
                  <ResourceCardLink id={entry.resource.id} kind={entry.resource.kind}>
                    {entry.resource.name}
                  </ResourceCardLink>
                ) : (
                  entry.name
                )}
                {entry.notes && ` (${entry.notes})`}
                {entry.quantity && ` (${entry.quantity})`}
              </Fragment>
            )),
            ...(localizedResource.gear.currency
              ? [
                  <Fragment key="currency">
                    {localizedResource.gear.entries.length > 0 && ", "}
                    {localizedResource.gear.currency}
                  </Fragment>,
                ]
              : []),
          ]
        : localizedResource.gear.value,
    },
    {
      ...localizedResource.languages_info,
      value: linkResources
        ? localizedResource.languages_info.detail_parts.map((part, index) =>
            part.type === "resource" ? (
              <ResourceCardLink
                id={part.resource.id}
                key={`${part.resource.kind}:${part.resource.id}`}
                kind={part.resource.kind}
              >
                {part.resource.name}
              </ResourceCardLink>
            ) : (
              <Fragment key={index}>{part.value}</Fragment>
            ),
          )
        : localizedResource.languages_info.value,
    },
    localizedResource.senses,
  ];

  return (
    <ResourcePokerCard
      beforeDetails={
        <>
          <HStack gap={PokerCard.rem1000}>
            <SimpleGrid
              fontFamily="Mr Eaves Alt"
              rowGap={PokerCard.px2}
              templateColumns={`0.26in 0.22in 0.25in 0.25in`}
            >
              <AbilityHeader
                mod={localizedResource.ability_score_headers.modifier}
                save={localizedResource.ability_score_headers.save}
              />
              <AbilityRow
                category="physical"
                label={localizedResource.ability_scores.strength.card_label}
                modifier={localizedResource.ability_scores.strength.modifier}
                save={localizedResource.ability_scores.strength.save}
                score={localizedResource.ability_scores.strength.score}
              />
              <AbilityRow
                category="physical"
                label={localizedResource.ability_scores.dexterity.card_label}
                modifier={localizedResource.ability_scores.dexterity.modifier}
                save={localizedResource.ability_scores.dexterity.save}
                score={localizedResource.ability_scores.dexterity.score}
              />
              <AbilityRow
                category="physical"
                label={localizedResource.ability_scores.constitution.card_label}
                modifier={localizedResource.ability_scores.constitution.modifier}
                save={localizedResource.ability_scores.constitution.save}
                score={localizedResource.ability_scores.constitution.score}
              />
            </SimpleGrid>

            <SimpleGrid
              fontFamily="Mr Eaves Alt"
              rowGap={PokerCard.px2}
              templateColumns={`0.26in 0.22in 0.25in 0.25in`}
            >
              <AbilityHeader
                mod={localizedResource.ability_score_headers.modifier}
                save={localizedResource.ability_score_headers.save}
              />
              <AbilityRow
                category="mental"
                label={localizedResource.ability_scores.intelligence.card_label}
                modifier={localizedResource.ability_scores.intelligence.modifier}
                save={localizedResource.ability_scores.intelligence.save}
                score={localizedResource.ability_scores.intelligence.score}
              />
              <AbilityRow
                category="mental"
                label={localizedResource.ability_scores.wisdom.card_label}
                modifier={localizedResource.ability_scores.wisdom.modifier}
                save={localizedResource.ability_scores.wisdom.save}
                score={localizedResource.ability_scores.wisdom.score}
              />
              <AbilityRow
                category="mental"
                label={localizedResource.ability_scores.charisma.card_label}
                modifier={localizedResource.ability_scores.charisma.modifier}
                save={localizedResource.ability_scores.charisma.save}
                score={localizedResource.ability_scores.charisma.score}
              />
            </SimpleGrid>
          </HStack>

          <VStack
            align="flex-start"
            gap={PokerCard.rem0250}
            lineHeight={1}
            px={PokerCard.rem1000}
            w="full"
          >
            <HStack gap={PokerCard.rem1000} w="full">
              <SkillRow
                label={localizedResource.initiative.label}
                mod={localizedResource.initiative.value}
                value={localizedResource.initiative.passive}
              />

              <SkillRow
                label={localizedResource.perception.label}
                mod={localizedResource.perception.value}
                value={localizedResource.perception.passive}
              />
            </HStack>

            <HStack
              align="flex-start"
              borderBottomWidth={PokerCard.px1}
              borderColor="black"
              borderStyle="dashed"
              gap={PokerCard.rem1000}
              justify="space-between"
              w="full"
            >
              <Span fontStyle="italic">{localizedResource.speed.label}</Span>
              <Span>{localizedResource.speed.value}</Span>
            </HStack>
          </VStack>

          <PokerCard.LabeledValues compact={infoCompact} fields={fields} palette={palette} />
        </>
      }
      firstPageInfo={
        localizedResource.summoned_from_spell ? (
          <StatsSummoned localizedResource={localizedResource} />
        ) : (
          <StatsRegular localizedResource={localizedResource} />
        )
      }
      localizedResource={localizedResource}
      linkResources={linkResources}
      onPageCountChange={handlePageCountChange}
      palette={palette}
      startDetailsOnSecondPage
      {...rest}
    />
  );
}

CreatureCard.Placeholder = ResourcePokerCard.Placeholder;
CreatureCard.h = ResourcePokerCard.h;
CreatureCard.w = ResourcePokerCard.w;

//------------------------------------------------------------------------------
// Creature Stats Props
//------------------------------------------------------------------------------

type CreatureStatsProps = {
  localizedResource: LocalizedCreature;
};

//------------------------------------------------------------------------------
// Stats Summoned
//------------------------------------------------------------------------------

function StatsSummoned({ localizedResource }: CreatureStatsProps) {
  const showSpellLevelLegend = Boolean(localizedResource.spell_level_legend);

  return (
    <SimpleGrid
      alignItems="center"
      columnGap={PokerCard.rem0750}
      px={PokerCard.rem1000}
      templateColumns="auto minmax(0, 1fr)"
      templateRows={showSpellLevelLegend ? "repeat(2, 1fr) auto" : "repeat(2, 1fr)"}
      w="full"
    >
      <GridItem rowSpan={showSpellLevelLegend ? 3 : 2}>
        <StatIcon
          icon={shieldIcon}
          label={localizedResource.armor_class.short_label}
          valueFontSize={
            localizedResource.armor_class.value.length > 2 ? PokerCard.rem0700 : undefined
          }
          value={localizedResource.armor_class.value}
        />
      </GridItem>
      <VStack align="flex-start" gap={0} textAlign="left" w="full">
        <Span lineHeight="shorter">
          <b>{localizedResource.hit_points.card_label}</b>{" "}
          <Span>{localizedResource.hit_points.value}</Span>
        </Span>
      </VStack>
      <Span textAlign="left" w="full">
        <b>{localizedResource.proficiency_bonus.card_label}</b>{" "}
        <Span>{localizedResource.proficiency_bonus.value}</Span>
      </Span>
      {showSpellLevelLegend && (
        <GridItem colStart={2}>
          <Span
            display="block"
            fontSize={PokerCard.rem0625}
            lineHeight="shorter"
            textAlign="left"
            w="full"
          >
            <Span fontStyle="italic">{localizedResource.spell_level_legend}</Span>
          </Span>
        </GridItem>
      )}
    </SimpleGrid>
  );
}

//------------------------------------------------------------------------------
// Stats Regular
//------------------------------------------------------------------------------

function StatsRegular({ localizedResource }: CreatureStatsProps) {
  return (
    <HStack gap={0} justify="space-between" px={PokerCard.rem1000} w="full">
      <HStack gap={PokerCard.rem0750}>
        <StatIcon
          icon={shieldIcon}
          label={localizedResource.armor_class.short_label}
          value={localizedResource.armor_class.value}
        />
        <VStack align="flex-start" gap={0} maxW="7em" textAlign="center">
          <Span lineHeight="shorter">
            <b>{localizedResource.hit_points.card_label}</b>{" "}
            <Span>{localizedResource.hit_points.value}</Span>
          </Span>
          <Span lineHeight="shorter">{localizedResource.hit_points.formula}</Span>
        </VStack>
      </HStack>
      <HStack gap={PokerCard.rem0750}>
        <VStack align="flex-end" flex={1} gap={0}>
          <Span textAlign="right" w="full">
            <b>{localizedResource.proficiency_bonus.card_label}</b>{" "}
            <Span>{localizedResource.proficiency_bonus.value}</Span>
          </Span>
          <Span textAlign="right" w="full">
            <b>{localizedResource.experience.short_label}</b>{" "}
            <Span>{localizedResource.experience.value}</Span>
          </Span>
          {localizedResource.experience.lair.value &&
            localizedResource.experience.value !== localizedResource.experience.lair.value && (
              <Span textAlign="right" w="full">
                <b>{localizedResource.experience.lair.label}</b>{" "}
                <Span>{localizedResource.experience.lair.value}</Span>
              </Span>
            )}
        </VStack>
        <StatIcon
          icon={scrollIcon}
          label={localizedResource.challenge_rating.short_label}
          value={localizedResource.challenge_rating.value}
        />
      </HStack>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Ability Header
//------------------------------------------------------------------------------

type AbilityHeaderProps = {
  mod: string;
  save: string;
};

function AbilityHeader({ mod, save }: AbilityHeaderProps) {
  return (
    <>
      <GridItem colSpan={2} />
      <Span fontSize={PokerCard.rem0500} textAlign="center">
        {mod}
      </Span>
      <Span fontSize={PokerCard.rem0500} textAlign="center">
        {save}
      </Span>
    </>
  );
}

//------------------------------------------------------------------------------
// Ability Row
//------------------------------------------------------------------------------

type AbilityRowProps = {
  category: "mental" | "physical";
  label: string;
  modifier: string;
  save: string;
  score: string;
};

function AbilityRow({ category, label, modifier, save, score }: AbilityRowProps) {
  const colors = abilityRowColors[category];
  return (
    <>
      <Span bgColor={colors.left} pl={PokerCard.rem0375}>
        {label}
      </Span>
      <Span bgColor={colors.left} pr={PokerCard.rem0375} textAlign="right">
        {score}
      </Span>
      <Span bgColor={colors.right} textAlign="center">
        {modifier}
      </Span>
      <Span bgColor={colors.right} textAlign="center">
        {save}
      </Span>
    </>
  );
}

const abilityRowColors = {
  mental: { left: "#CBCBD1", right: "#C3ACBE" },
  physical: { left: "#EFE3E2", right: "#DAC1C4" },
};

//------------------------------------------------------------------------------
// Skill Row
//------------------------------------------------------------------------------

type SkillRowProps = {
  label: string;
  mod: string;
  value: string;
};

function SkillRow({ label, mod, value }: SkillRowProps) {
  return (
    <HStack
      borderBottomWidth={PokerCard.px1}
      borderColor="black"
      borderStyle="dashed"
      flex={1}
      gap={0}
      justify="space-between"
    >
      <Span fontStyle="italic">{label}</Span>
      <Span>{`${mod} (${value})`}</Span>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Stat Icon
//------------------------------------------------------------------------------

type StatIconProps = {
  icon: string;
  label: string;
  value: string;
  valueFontSize?: string;
};

function StatIcon({ icon, label, value, valueFontSize }: StatIconProps) {
  return (
    <VStack
      color="white"
      fontWeight="bold"
      gap={0}
      h={`${PokerCard.remToIn(2.5)}in`}
      justify="center"
      position="relative"
      pt={PokerCard.rem0250}
      w={`${PokerCard.remToIn(2.5)}in`}
    >
      <Box
        bgImage={`url("data:image/svg+xml,${icon}")`}
        bgRepeat="no-repeat"
        bgSize="100% 100%"
        inset={0}
        position="absolute"
      />
      <Span fontSize={PokerCard.rem0625} position="relative" zIndex={1}>
        {label}
      </Span>
      <HStack
        align="baseline"
        gap={PokerCard.rem0125}
        justify="center"
        maxW="90%"
        minH={PokerCard.rem1000}
        position="relative"
        zIndex={1}
      >
        <Span fontSize={valueFontSize} lineHeight="shorter" textAlign="center" whiteSpace="nowrap">
          {value}
        </Span>
      </HStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Icons
//------------------------------------------------------------------------------

const shieldIcon = encodeURIComponent(`\
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 0C21.875 0.999998 33.125 0.999998 50 0.000160217C66.875 0.999835 78.125 0.999842 95 4.02331e-06C93 22 95 34 95 57.0001C95 69 93.875 79 83.75 89C73.625 96 61.25 97 50 100C38.75 97 26.375 96 16.25 89C6.125 79 5 69.5 5 57.5C5 35 7 23 5 0Z" fill="${PokerCard.separatorColor}"/>
</svg>`);

const scrollIcon = encodeURIComponent(`\
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 0H90H93C94.1046 0 95 0.895431 95 2V3H97C97.5523 3 98 3.44772 98 4V7V10C98 10.5523 97.5523 11 97 11H95V12C95 13.1046 94.1046 14 93 14H90V92.9241C90 94.6103 88.6107 95.9653 86.925 95.9231L50 95L13.075 95.9231C11.3893 95.9653 10 94.6103 10 92.9241V14H7C5.89543 14 5 13.1046 5 12V11H3C2.44772 11 2 10.5523 3 3H5V2C5 0.895431 5.89543 0 7 0H10Z" fill="${PokerCard.separatorColor}"/>
</svg>`);
