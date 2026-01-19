import { HStack, Span, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import D10Icon from "~/icons/d10-icon";
import D12Icon from "~/icons/d12-icon";
import D20Icon from "~/icons/d20-icon";
import D4Icon from "~/icons/d4-icon";
import D6Icon from "~/icons/d6-icon";
import D8Icon from "~/icons/d8-icon";
import type { CharacterClass } from "~/models/resources/character-classes/character-class";
import type { LocalizedCharacterClass } from "~/models/resources/character-classes/localized-character-class";
import Icon from "~/ui/icon";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../resource-poker-card";

//------------------------------------------------------------------------------
// Character Class Card
//------------------------------------------------------------------------------

export type CharacterClassCardProps = Omit<
  ResourcePokerCardProps<CharacterClass, LocalizedCharacterClass>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function CharacterClassCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: CharacterClassCardProps) {
  const { t, tp } = useI18nLangContext(i18nContext);
  const primaryAbilitiesCount = localizedResource._raw.primary_abilities.length;

  return (
    <ResourcePokerCard
      beforeDetails={
        <PokerCard.Info palette={palette}>
          {localizedResource.info}
        </PokerCard.Info>
      }
      firstPageInfo={
        <HStack justify="space-between" px={PokerCard.rem0750} w="full">
          <HStack gap={PokerCard.rem0250}>
            <Icon Icon={dieIcons[localizedResource._raw.hp_die]} size="lg" />
            <VStack
              align="flex-start"
              fontSize={PokerCard.rem0750}
              fontStyle="italic"
              fontWeight="bold"
              gap={0}
            >
              <Span>{t("hp_die.top")}</Span>
              <Span>{t("hp_die.bottom")}</Span>
            </VStack>
          </HStack>

          <VStack align="flex-end" fontSize={PokerCard.rem0875} gap={0}>
            <Span fontStyle="italic" fontWeight="bold">
              {tp("abilities", primaryAbilitiesCount)}
            </Span>
            <Span>
              {localizedResource.primary_abilities ?? t("abilities.none")}
            </Span>
          </VStack>
        </HStack>
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

CharacterClassCard.Placeholder = ResourcePokerCard.Placeholder;
CharacterClassCard.h = ResourcePokerCard.h;
CharacterClassCard.w = ResourcePokerCard.w;

//------------------------------------------------------------------------------
// Die Icons
//------------------------------------------------------------------------------

const dieIcons = {
  d4: D4Icon,
  d6: D6Icon,
  d8: D8Icon,
  d10: D10Icon,
  d12: D12Icon,
  d20: D20Icon,
} as const;

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "abilities.none": {
    en: "None",
    it: "Nessuna",
  },
  "abilities/*": {
    en: "Primary Abilities",
    it: "Abilità Primarie",
  },
  "abilities/0": {
    en: "Primary Ability",
    it: "Abilità Primaria",
  },
  "abilities/1": {
    en: "Primary Ability",
    it: "Abilità Primaria",
  },
  "hp_die.bottom": {
    en: "Die",
    it: "Vita",
  },
  "hp_die.top": {
    en: "HP",
    it: "Dado",
  },
  "skill_proficiencies_pool": {
    en: "Skill Proficiencies",
    it: "Competenze nelle Abilità",
  },
  "starting_equipment": {
    en: "Equipment",
    it: "Equipaggiamento",
  },
};
