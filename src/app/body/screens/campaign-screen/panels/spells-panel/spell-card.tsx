import { SimpleGrid, Span, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { useIsSpellSelected } from "../../../../../../resources/spell";
import type { SpellTranslation } from "../../../../../../resources/spell-translation";
import ResourceCard from "../resource-card";

//------------------------------------------------------------------------------
// Spell Card
//------------------------------------------------------------------------------

export type SpellCardProps = {
  resource: SpellTranslation;
};

export default function SpellCard({ resource }: SpellCardProps) {
  const {
    campaign,
    casting_time_with_ritual,
    character_classes,
    components,
    description,
    duration_with_concentration,
    id,
    level_long,
    materials,
    name,
    range,
    school,
  } = resource;

  const { t } = useI18nLangContext(i18nContext);

  const [selected, { toggle }] = useIsSpellSelected(id);

  return (
    <ResourceCard>
      <ResourceCard.Header onToggleSelection={toggle} selected={selected}>
        <ResourceCard.Title>{name}</ResourceCard.Title>
      </ResourceCard.Header>

      <ResourceCard.Caption>
        <Span>{school}</Span>
        <Span>{level_long}</Span>
      </ResourceCard.Caption>

      <SimpleGrid columns={2} fontSize="xs" gap={1} p={2} w="full">
        <VStack gap={0}>
          <Span color="fg.muted">{t("casting_time")}</Span>
          <Span>{casting_time_with_ritual}</Span>
        </VStack>

        <VStack gap={0}>
          <Span color="fg.muted">{t("duration")}</Span>
          <Span>{duration_with_concentration}</Span>
        </VStack>

        <VStack gap={0}>
          <Span color="fg.muted">{t("components")}</Span>
          <Span>{components}</Span>
        </VStack>

        <VStack gap={0}>
          <Span color="fg.muted">{t("range")}</Span>
          <Span>{range}</Span>
        </VStack>
      </SimpleGrid>

      <ResourceCard.Caption>
        <Span>{materials}</Span>
      </ResourceCard.Caption>

      <ResourceCard.Description description={description} />

      <ResourceCard.Caption>
        <Span>{character_classes}</Span>
        <Span>{campaign}</Span>
      </ResourceCard.Caption>
    </ResourceCard>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  casting_time: {
    en: "Casting Time",
    it: "Tempo di Lancio",
  },

  duration: {
    en: "Duration",
    it: "Durata",
  },

  components: {
    en: "Components",
    it: "Componenti",
  },

  range: {
    en: "Range",
    it: "Gittata",
  },
};
