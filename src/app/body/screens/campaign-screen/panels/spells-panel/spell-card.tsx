import { Center, SimpleGrid, Span, VStack } from "@chakra-ui/react";
import type { SpellTranslation } from "../../../../../../resources/spell-translation";
import ResourceCard from "../../../../../../ui/resource-card";

//------------------------------------------------------------------------------
// Spell Card
//------------------------------------------------------------------------------

export type SpellCardProps = {
  spellTranslation: SpellTranslation;
};

export default function SpellCard({ spellTranslation }: SpellCardProps) {
  const {
    casting_time_with_ritual,
    character_classes,
    components,
    description,
    duration_with_concentration,
    level,
    materials,
    name,
    range,
    school,
  } = spellTranslation;

  return (
    <ResourceCard>
      <ResourceCard.Title title={name}>
        <Span w="1.6em" />

        <Center
          aspectRatio={1}
          bgColor="bg.inverted"
          color="fg.inverted"
          h="1.6em"
          p={1}
          position="absolute"
          right={2}
          rounded="full"
        >
          {level}
        </Center>
      </ResourceCard.Title>

      <ResourceCard.Caption>
        <Span>{character_classes}</Span>
        <Span>{school}</Span>
      </ResourceCard.Caption>

      <SimpleGrid columns={2} fontSize="xs" gap={1} p={2} w="full">
        <VStack gap={0}>
          <Span color="fg.muted">Tempo di Lancio</Span>
          <Span>{casting_time_with_ritual}</Span>
        </VStack>

        <VStack gap={0}>
          <Span color="fg.muted">Durata</Span>
          <Span>{duration_with_concentration}</Span>
        </VStack>

        <VStack gap={0}>
          <Span color="fg.muted">Componenti</Span>
          <Span>{components}</Span>
        </VStack>

        <VStack gap={0}>
          <Span color="fg.muted">Gittata</Span>
          <Span>{range}</Span>
        </VStack>
      </SimpleGrid>

      <ResourceCard.Caption>
        <Span>{materials}</Span>
      </ResourceCard.Caption>

      <ResourceCard.Description description={description} />

      <ResourceCard.Caption>
        <Span>PHB24</Span>
      </ResourceCard.Caption>
    </ResourceCard>
  );
}
