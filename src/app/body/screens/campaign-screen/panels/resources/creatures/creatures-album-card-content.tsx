import {
  GridItem,
  HStack,
  Separator,
  SimpleGrid,
  Span,
  type StackProps,
  VStack,
} from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import AlbumCard from "~/ui/album-card";

//------------------------------------------------------------------------------
// Creatures Album Card Content Page 0
//------------------------------------------------------------------------------

export type CreaturesAlbumCardContentPage0Props = StackProps & {
  localizedResource: LocalizedCreature;
};

export function CreaturesAlbumCardContentPage0({
  localizedResource,
  ...rest
}: CreaturesAlbumCardContentPage0Props) {
  const {
    ac,
    cr,
    exp,
    gear,
    habitats,
    hp,
    hp_formula,
    immunities,
    initiative,
    initiative_passive,
    languages,
    passive_perception,
    pb,
    resistances,
    senses,
    skills,
    speed,
    title,
    treasures,
    vulnerabilities,
  } = localizedResource;

  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack {...rest}>
      <AlbumCard.Caption>
        <Span>{title}</Span>
      </AlbumCard.Caption>

      <HStack
        fontSize="xs"
        gap={3}
        px={3}
        py={2}
        separator={<Separator h="full" />}
        w="full"
      >
        <AlbumCard.Info
          flex={1}
          p={0}
          templateColumns="repeat(3, max-content) 1fr"
        >
          <AlbumCard.InfoCell label={t("armor_class")}>
            <GridItem colSpan={3}>{ac}</GridItem>
          </AlbumCard.InfoCell>

          <AlbumCard.InfoCell label={t("hp")}>
            <GridItem>{hp}</GridItem>
            <GridItem>{hp_formula ? ">" : ""}</GridItem>
            <GridItem>{hp_formula}</GridItem>
          </AlbumCard.InfoCell>

          <AlbumCard.InfoCell label={t("passive_perception")}>
            <GridItem colSpan={3}>{passive_perception}</GridItem>
          </AlbumCard.InfoCell>

          <AlbumCard.InfoCell label={t("initiative")}>
            <GridItem>{initiative}</GridItem>
            <GridItem>&gt;</GridItem>
            <GridItem>{initiative_passive}</GridItem>
          </AlbumCard.InfoCell>

          <AlbumCard.InfoCell label={t("challenge_rating")}>
            <GridItem colSpan={3}>{cr}</GridItem>
          </AlbumCard.InfoCell>

          <AlbumCard.InfoCell label={t("proficiency_bonus")}>
            <GridItem colSpan={3}>{pb}</GridItem>
          </AlbumCard.InfoCell>

          <AlbumCard.InfoCell label={t("experience_points")}>
            <GridItem colSpan={3}>{exp}</GridItem>
          </AlbumCard.InfoCell>
        </AlbumCard.Info>

        <SimpleGrid flex={1} gap={1} templateColumns="1.8em repeat(3, 1fr)">
          <Span />
          <Span color="fg.muted" textAlign="right">
            {t("ability.score")}
          </Span>
          <Span color="fg.muted" textAlign="right">
            {t("ability.modifier")}
          </Span>
          <Span color="fg.muted" textAlign="right">
            {t("ability.save")}
          </Span>

          <AbilityBody ability="str" creature={localizedResource} />
          <AbilityBody ability="dex" creature={localizedResource} />
          <AbilityBody ability="con" creature={localizedResource} />
          <AbilityBody ability="int" creature={localizedResource} />
          <AbilityBody ability="wis" creature={localizedResource} />
          <AbilityBody ability="cha" creature={localizedResource} />
        </SimpleGrid>
      </HStack>

      <AlbumCard.Info>
        <AlbumCard.InfoCell label={t("speed")}>{speed}</AlbumCard.InfoCell>
      </AlbumCard.Info>

      <AlbumCard.Info>
        <AlbumCard.InfoCell label={t("habitats")}>
          {habitats}
        </AlbumCard.InfoCell>

        <AlbumCard.InfoCell label={t("treasures")}>
          {treasures}
        </AlbumCard.InfoCell>
      </AlbumCard.Info>

      <HStack align="flex-start" flex={1} w="full">
        <AlbumCard.Info>
          {skills && (
            <AlbumCard.InfoCell label={t("skills")}>
              {skills}
            </AlbumCard.InfoCell>
          )}

          {immunities && (
            <AlbumCard.InfoCell label={t("immunities")}>
              {immunities}
            </AlbumCard.InfoCell>
          )}

          {resistances && (
            <AlbumCard.InfoCell label={t("resistances")}>
              {resistances}
            </AlbumCard.InfoCell>
          )}

          {vulnerabilities && (
            <AlbumCard.InfoCell label={t("vulnerabilities")}>
              {vulnerabilities}
            </AlbumCard.InfoCell>
          )}

          {gear && (
            <AlbumCard.InfoCell label={t("gear")}>{gear}</AlbumCard.InfoCell>
          )}

          {languages && (
            <AlbumCard.InfoCell label={t("languages")}>
              {languages}
            </AlbumCard.InfoCell>
          )}

          {senses && (
            <AlbumCard.InfoCell label={t("senses")}>
              {senses}
            </AlbumCard.InfoCell>
          )}
        </AlbumCard.Info>
      </HStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Creatures Album Card Content Page 1
//------------------------------------------------------------------------------

export type CreaturesAlbumCardContentPage1Props = StackProps & {
  localizedResource: LocalizedCreature;
};

export function CreaturesAlbumCardContentPage1({
  localizedResource,
  ...rest
}: CreaturesAlbumCardContentPage1Props) {
  const { description } = localizedResource;

  return (
    <VStack {...rest}>
      <AlbumCard.Description description={description} />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Ability Body
//------------------------------------------------------------------------------

function AbilityBody({
  ability,
  creature,
}: {
  ability: "str" | "dex" | "con" | "int" | "wis" | "cha";
  creature: LocalizedCreature;
}) {
  const { t } = useI18nLangContext(i18nContext);
  return (
    <>
      <Span color="fg.muted">{t(`ability[${ability}]`)}</Span>
      <Span textAlign="right">{creature[`ability_${ability}`]}</Span>
      <Span textAlign="right">{creature[`ability_${ability}_mod`]}</Span>
      <Span textAlign="right">{creature[`ability_${ability}_save`]}</Span>
    </>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability.modifier": {
    en: "M",
    it: "M",
  },
  "ability.save": {
    en: "ST",
    it: "TS",
  },
  "ability.score": {
    en: "S",
    it: "P",
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
  "cr_exp_pb": {
    en: "CR <1> (XP <2>, PB <3>)",
    it: "GS <1> (PE <2>, BC <3>)",
  },
  "experience_points": {
    en: "XP",
    it: "PE",
  },
  "gear": {
    en: "Gear",
    it: "Oggetti",
  },
  "habitats": {
    en: "Habitat",
    it: "Habitat",
  },
  "hp": {
    en: "HP",
    it: "PF",
  },
  "immunities": {
    en: "Immunities",
    it: "Immunità",
  },
  "initiative": {
    en: "Init.",
    it: "Iniz.",
  },
  "languages": {
    en: "Languages",
    it: "Lingue",
  },
  "passive_perception": {
    en: "PP",
    it: "PP",
  },
  "proficiency_bonus": {
    en: "PB",
    it: "BC",
  },
  "resistances": {
    en: "Resistances",
    it: "Resistenze",
  },
  "senses": {
    en: "Senses",
    it: "Sensi",
  },
  "skills": {
    en: "Skills",
    it: "Abilità",
  },
  "speed": {
    en: "Speed",
    it: "Velocità",
  },
  "stats": {
    en: "##Info##\n<1>",
    it: "##Info##\n<1>",
  },
  "stats_and_description": {
    en: "##Info##\n<1>\n\n<2>",
    it: "##Info##\n<1>\n\n<2>",
  },
  "treasures": {
    en: "Treasures",
    it: "Tesori",
  },
  "vulnerabilities": {
    en: "Vulnerabilities",
    it: "Vulnerabilità",
  },
};
