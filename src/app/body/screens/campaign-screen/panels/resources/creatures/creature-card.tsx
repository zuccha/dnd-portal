import { HStack, SimpleGrid, Span } from "@chakra-ui/react";
import { useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Creature } from "~/models/resources/creatures/creature";
import { useIsCreatureSelected } from "~/models/resources/creatures/creatures-store";
import type { LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import ResourceCard from "../_base/resource-card";

//------------------------------------------------------------------------------
// Creature Card
//------------------------------------------------------------------------------

export type CreatureCardProps = {
  canEdit: boolean;
  localizedResource: LocalizedCreature;
  onOpen: (resource: Creature) => void;
};

export default function CreatureCard({
  canEdit,
  localizedResource,
  onOpen,
}: CreatureCardProps) {
  const {
    ac,
    alignment,
    cr,
    description,
    exp,
    gear,
    habitats,
    hp,
    hp_formula,
    id,
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
    title_partial,
    treasures,
    vulnerabilities,
  } = localizedResource;

  const { t } = useI18nLangContext(i18nContext);

  const [selected, { toggle }] = useIsCreatureSelected(id);
  const [front, setFront] = useState(true);

  if (!front)
    return (
      <ResourceCard
        canEdit={canEdit}
        localizedResource={localizedResource}
        onOpen={onOpen}
        onToggleFront={() => setFront((prev) => !prev)}
        onToggleSelected={toggle}
        selected={selected}
      >
        <ResourceCard.Description description={description} />
      </ResourceCard>
    );

  return (
    <ResourceCard
      canEdit={canEdit}
      localizedResource={localizedResource}
      onOpen={onOpen}
      onToggleFront={() => setFront((prev) => !prev)}
      onToggleSelected={toggle}
      selected={selected}
    >
      <ResourceCard.Caption>
        <Span>{`${title_partial}, ${alignment}`}</Span>
      </ResourceCard.Caption>

      <ResourceCard.Info>
        <ResourceCard.InfoCell label={t("habitats")}>
          {habitats}
        </ResourceCard.InfoCell>

        <ResourceCard.InfoCell label={t("treasures")}>
          {treasures}
        </ResourceCard.InfoCell>
      </ResourceCard.Info>

      <HStack fontSize="xs" px={3} py={2} w="full">
        <ResourceCard.Info flex={1} p={0}>
          <ResourceCard.InfoCell label={t("armor_class")}>
            {ac}
          </ResourceCard.InfoCell>

          <ResourceCard.InfoCell label={t("hp")}>
            {hp_formula ? `${hp} (${hp_formula})` : hp}
          </ResourceCard.InfoCell>

          <ResourceCard.InfoCell label={t("passive_perception")}>
            {passive_perception}
          </ResourceCard.InfoCell>

          <ResourceCard.InfoCell label={t("initiative")}>
            {`${initiative} (${initiative_passive})`}
          </ResourceCard.InfoCell>

          <ResourceCard.InfoCell label={t("challenge_rating")}>
            {cr}
          </ResourceCard.InfoCell>

          <ResourceCard.InfoCell label={t("proficiency_bonus")}>
            {pb}
          </ResourceCard.InfoCell>

          <ResourceCard.InfoCell label={t("experience_points")}>
            {exp}
          </ResourceCard.InfoCell>
        </ResourceCard.Info>

        <SimpleGrid
          flex={1}
          gap={1}
          justifyContent="flex-end"
          templateColumns="1.8em repeat(3, 2.2em)"
        >
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

      <ResourceCard.Info>
        <ResourceCard.InfoCell label={t("speed")}>
          {speed}
        </ResourceCard.InfoCell>
      </ResourceCard.Info>

      <HStack align="flex-start" flex={1} w="full">
        <ResourceCard.Info>
          {skills && (
            <ResourceCard.InfoCell label={t("skills")}>
              {skills}
            </ResourceCard.InfoCell>
          )}

          {immunities && (
            <ResourceCard.InfoCell label={t("immunities")}>
              {immunities}
            </ResourceCard.InfoCell>
          )}

          {resistances && (
            <ResourceCard.InfoCell label={t("resistances")}>
              {resistances}
            </ResourceCard.InfoCell>
          )}

          {vulnerabilities && (
            <ResourceCard.InfoCell label={t("vulnerabilities")}>
              {vulnerabilities}
            </ResourceCard.InfoCell>
          )}

          {gear && (
            <ResourceCard.InfoCell label={t("gear")}>
              {gear}
            </ResourceCard.InfoCell>
          )}

          {languages && (
            <ResourceCard.InfoCell label={t("languages")}>
              {languages}
            </ResourceCard.InfoCell>
          )}

          {senses && (
            <ResourceCard.InfoCell label={t("senses")}>
              {senses}
            </ResourceCard.InfoCell>
          )}
        </ResourceCard.Info>
      </HStack>
    </ResourceCard>
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
    en: "TS",
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
