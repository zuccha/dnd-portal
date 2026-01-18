import { GridItem, HStack, SimpleGrid, Span, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Creature } from "~/models/resources/creatures/creature";
import type { LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../_base/resource-poker-card";

//------------------------------------------------------------------------------
// Creature Card
//------------------------------------------------------------------------------

export type CreatureCardProps = Omit<
  ResourcePokerCardProps<Creature, LocalizedCreature>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function CreatureCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: CreatureCardProps) {
  const { t } = useI18nLangContext(i18nContext);

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
              <AbilityHeader mod={t("ability.mod")} save={t("ability.save")} />
              <AbilityRow
                category="physical"
                label={t("ability[str]")}
                modifier={localizedResource.ability_str_mod}
                save={localizedResource.ability_str_save}
                score={localizedResource.ability_str}
              />
              <AbilityRow
                category="physical"
                label={t("ability[dex]")}
                modifier={localizedResource.ability_dex_mod}
                save={localizedResource.ability_dex_save}
                score={localizedResource.ability_dex}
              />
              <AbilityRow
                category="physical"
                label={t("ability[con]")}
                modifier={localizedResource.ability_con_mod}
                save={localizedResource.ability_con_save}
                score={localizedResource.ability_con}
              />
            </SimpleGrid>

            <SimpleGrid
              fontFamily="Mr Eaves Alt"
              rowGap={PokerCard.px2}
              templateColumns={`0.26in 0.22in 0.25in 0.25in`}
            >
              <AbilityHeader mod={t("ability.mod")} save={t("ability.save")} />
              <AbilityRow
                category="mental"
                label={t("ability[int]")}
                modifier={localizedResource.ability_int_mod}
                save={localizedResource.ability_int_save}
                score={localizedResource.ability_int}
              />
              <AbilityRow
                category="mental"
                label={t("ability[wis]")}
                modifier={localizedResource.ability_wis_mod}
                save={localizedResource.ability_wis_save}
                score={localizedResource.ability_wis}
              />
              <AbilityRow
                category="mental"
                label={t("ability[cha]")}
                modifier={localizedResource.ability_cha_mod}
                save={localizedResource.ability_cha_save}
                score={localizedResource.ability_cha}
              />
            </SimpleGrid>
          </HStack>

          <VStack
            align="flex-start"
            gap={PokerCard.rem0250}
            px={PokerCard.rem1000}
            w="full"
          >
            <HStack gap={PokerCard.rem1000} w="full">
              <SkillRow
                label={t("initiative")}
                mod={localizedResource.initiative}
                value={localizedResource.initiative_passive}
              />

              <SkillRow
                label={t("perception")}
                mod={localizedResource.perception}
                value={localizedResource.perception_passive}
              />
            </HStack>

            <HStack
              borderBottomWidth={PokerCard.px1}
              borderColor="black"
              borderStyle="dashed"
              gap={PokerCard.rem1000}
              justify="space-between"
              w="full"
            >
              <Span fontStyle="italic">{t("speed")}</Span>
              <Span>{localizedResource.speed}</Span>
            </HStack>
          </VStack>

          {localizedResource.info && (
            <PokerCard.Info palette={palette}>
              {localizedResource.info}
            </PokerCard.Info>
          )}

          <HStack minH="full" />
        </>
      }
      firstPageInfo={
        <HStack gap={0} justify="space-between" px={PokerCard.rem0750} w="full">
          <HStack gap={PokerCard.rem0750}>
            <StatIcon
              icon={shieldIcon}
              label={t("armor_class")}
              value={localizedResource.ac}
            />
            <VStack align="flex-start" gap={0}>
              <Span>
                <b>{t("hit_points")}</b> <Span>{localizedResource.hp}</Span>
              </Span>
              <Span>{localizedResource.hp_formula}</Span>
            </VStack>
          </HStack>

          <HStack gap={PokerCard.rem0750}>
            <VStack align="flex-end" flex={1} gap={0}>
              <Span>
                <b>{t("challenge_rating")}</b>{" "}
                <Span>{localizedResource.cr}</Span>
              </Span>
              <Span>{`${t("exp")} ${localizedResource.exp}`}</Span>
            </VStack>
            <StatIcon
              icon={scrollIcon}
              label={t("proficiency_bonus")}
              value={localizedResource.pb}
            />
          </HStack>
        </HStack>
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

CreatureCard.h = PokerCard.cardH;
CreatureCard.w = PokerCard.cardW;

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

function AbilityRow({
  category,
  label,
  modifier,
  save,
  score,
}: AbilityRowProps) {
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
};

function StatIcon({ icon, label, value }: StatIconProps) {
  return (
    <VStack
      bgImage={`url("data:image/svg+xml,${icon}")`}
      bgRepeat="no-repeat"
      bgSize="100% 100%"
      color="white"
      gap={0}
      h={`${PokerCard.remToIn(2.5)}in`}
      justify="center"
      pt={PokerCard.rem0250}
      w={`${PokerCard.remToIn(2.5)}in`}
    >
      <Span fontSize={PokerCard.rem0625}>{label}</Span>
      <Span>{value}</Span>
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
  <path d="M10 0H90H93C94.1046 0 95 0.895431 95 2V3H97C97.5523 3 98 3.44772 98 4V7V10C98 10.5523 97.5523 11 97 11H95V12C95 13.1046 94.1046 14 93 14H90V92.9241C90 94.6103 88.6107 95.9653 86.925 95.9231L50 95L13.075 95.9231C11.3893 95.9653 10 94.6103 10 92.9241V14H7C5.89543 14 5 13.1046 5 12V11H3C2.44772 11 2 10.5523 2 10V7V4C2 3.44772 2.44772 3 3 3H5V2C5 0.895431 5.89543 0 7 0H10Z" fill="${PokerCard.separatorColor}"/>
</svg>`);

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability.mod": {
    en: "MOD",
    it: "MOD",
  },
  "ability.save": {
    en: "SAVE",
    it: "SALV",
  },
  "ability[cha]": {
    en: "Cha",
    it: "Car",
  },
  "ability[con]": {
    en: "Con",
    it: "Cos",
  },
  "ability[dex]": {
    en: "Dex",
    it: "Des",
  },
  "ability[int]": {
    en: "Int",
    it: "Int",
  },
  "ability[str]": {
    en: "Str",
    it: "For",
  },
  "ability[wis]": {
    en: "Wis",
    it: "Sag",
  },
  "armor_class": {
    en: "AC",
    it: "CA",
  },
  "challenge_rating": {
    en: "CR",
    it: "GS",
  },
  "exp": {
    en: "XP",
    it: "PE",
  },
  "hit_points": {
    en: "HP",
    it: "PF",
  },
  "initiative": {
    en: "Initiative",
    it: "Iniziativa",
  },
  "perception": {
    en: "Perception",
    it: "Percezione",
  },
  "proficiency_bonus": {
    en: "PB",
    it: "BC",
  },
  "speed": {
    en: "Speed",
    it: "Velocità",
  },
};
