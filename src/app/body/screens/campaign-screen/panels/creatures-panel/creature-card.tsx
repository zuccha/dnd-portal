import { GridItem, SimpleGrid, Span } from "@chakra-ui/react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import type { Creature } from "../../../../../../resources/creatures/creature";
import { useIsCreatureSelected } from "../../../../../../resources/creatures/creatures-store";
import type { LocalizedCreature } from "../../../../../../resources/creatures/localized-creature";
import ResourceCard from "../resources/resource-card";

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
    _raw,
    campaign,
    cr_exp_pb,
    description,
    id,
    name,
    speed,
    stats,
    title,
  } = localizedResource;

  const { t, ti } = useI18nLangContext(i18nContext);

  const [selected, { toggle }] = useIsCreatureSelected(id);

  return (
    <ResourceCard
      canEdit={canEdit}
      name={name}
      onOpen={() => onOpen(localizedResource._raw)}
      onToggleSelected={toggle}
      selected={selected}
      visibility={_raw.visibility}
    >
      <ResourceCard.Caption>
        <Span>{title}</Span>
      </ResourceCard.Caption>

      <SimpleGrid columns={10} fontSize="xs" gap={1} px={3} py={2} w="full">
        <Span color="fg.muted">{t("ac")}</Span>
        <GridItem colSpan={4}>{localizedResource.ac}</GridItem>

        <Span color="fg.muted">{t("hp")}</Span>
        <GridItem
          colSpan={4}
        >{`${localizedResource.hp} (${localizedResource.hp_formula})`}</GridItem>

        <Span color="fg.muted">{t("passive_perception")}</Span>
        <GridItem colSpan={4}>{localizedResource.passive_perception}</GridItem>

        <Span color="fg.muted">{t("initiative")}</Span>
        <GridItem
          colSpan={4}
        >{`${localizedResource.initiative} (${localizedResource.initiative_passive})`}</GridItem>
      </SimpleGrid>

      <ResourceCard.Caption>
        <Span>{localizedResource.habitats}</Span>
        <Span>{localizedResource.treasures}</Span>
      </ResourceCard.Caption>

      <SimpleGrid columns={8} fontSize="xs" gapX={1} px={3} py={1} w="full">
        <AbilityBody ability="str" creature={localizedResource} />
        <AbilityBody ability="dex" creature={localizedResource} />
        <AbilityBody ability="con" creature={localizedResource} />
        <AbilityBody ability="int" creature={localizedResource} />
        <AbilityBody ability="wis" creature={localizedResource} />
        <AbilityBody ability="cha" creature={localizedResource} />
      </SimpleGrid>

      <ResourceCard.Caption>
        <Span>{ti("speed", speed)}</Span>
      </ResourceCard.Caption>

      <ResourceCard.Description description={ti("body", stats, description)} />

      <ResourceCard.Caption>
        <Span>{cr_exp_pb}</Span>
        <Span>{campaign}</Span>
      </ResourceCard.Caption>
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
      <Span color="fg.muted">{t(`ability.${ability}`)}</Span>
      <Span>{creature[`ability_${ability}`]}</Span>
      <Span>{creature[`ability_${ability}_mod`]}</Span>
      <Span>{creature[`ability_${ability}_save`]}</Span>
    </>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ac": {
    en: "AC",
    it: "CA",
  },

  "hp": {
    en: "HP",
    it: "PF",
  },

  "initiative": {
    en: "Init.",
    it: "Iniz.",
  },

  "passive_perception": {
    en: "PP",
    it: "PP",
  },

  "pb": {
    en: "PB",
    it: "BC",
  },

  "speed": {
    en: "Speed: <1>",
    it: "Velocità: <1>",
  },

  "ability_mod": {
    en: "M",
    it: "M",
  },

  "ability_save": {
    en: "S",
    it: "S",
  },

  "ability.str": {
    en: "Str",
    it: "For",
  },

  "ability.dex": {
    en: "Dex",
    it: "Des",
  },

  "ability.con": {
    en: "Con",
    it: "Cos",
  },

  "ability.int": {
    en: "Int",
    it: "Int",
  },

  "ability.wis": {
    en: "Wis",
    it: "Sag",
  },

  "ability.cha": {
    en: "Cha",
    it: "Car",
  },

  "body": {
    en: "# Info\n<1>\n\n<2>",
    it: "# Info\n<1>\n\n<2>",
  },
};
