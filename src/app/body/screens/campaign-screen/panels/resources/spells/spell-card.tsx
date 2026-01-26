import {
  Box,
  Center,
  GridItem,
  SimpleGrid,
  Span,
  VStack,
} from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedSpell } from "~/models/resources/spells/localized-spell";
import type { Spell } from "~/models/resources/spells/spell";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../resource-poker-card";

//------------------------------------------------------------------------------
// Spell Card
//------------------------------------------------------------------------------

export type SpellCardProps = Omit<
  ResourcePokerCardProps<Spell, LocalizedSpell>,
  "afterDescriptor" | "beforeDetails" | "firstPageInfo"
>;

export function SpellCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: SpellCardProps) {
  const { t } = useI18nLangContext(i18nContext);

  const casting_time = localizedResource.casting_time_with_ritual;
  const range = localizedResource.range;
  const components = localizedResource.components;
  const duration = localizedResource.duration_with_concentration;

  return (
    <ResourcePokerCard
      afterDescriptor={
        <Center
          fontFamily="Mr Eaves"
          fontSize={PokerCard.rem0750}
          fontStyle="normal"
          textTransform="uppercase"
        >
          {localizedResource.character_classes}
        </Center>
      }
      beforeDetails={
        <>
          <SimpleGrid columns={2} gap={0} px={PokerCard.rem1000} w="full">
            <VStack gap={0} pb={PokerCard.rem0125}>
              <Span fontFamily="Mr Eaves Alt" fontSize={PokerCard.rem1000}>
                {t("casting_time")}
              </Span>
              <Span textAlign="center">{casting_time}</Span>
            </VStack>

            <VStack gap={0} pb={PokerCard.rem0125}>
              <Span fontFamily="Mr Eaves Alt" fontSize={PokerCard.rem1000}>
                {t("range")}
              </Span>
              <Span textAlign="center">{range}</Span>
            </VStack>

            <Star />

            <VStack gap={0} pt={PokerCard.rem0125}>
              <Span fontFamily="Mr Eaves Alt" fontSize={PokerCard.rem1000}>
                {t("components")}
              </Span>
              <Span textAlign="center">{components}</Span>
            </VStack>

            <VStack gap={0} pt={PokerCard.rem0125}>
              <Span fontFamily="Mr Eaves Alt" fontSize={PokerCard.rem1000}>
                {t("duration")}
              </Span>
              <Span textAlign="center">{duration}</Span>
            </VStack>
          </SimpleGrid>

          <PokerCard.Separator />

          {localizedResource.info && (
            <PokerCard.Info palette={palette}>
              {localizedResource.info}
            </PokerCard.Info>
          )}
        </>
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

SpellCard.Placeholder = ResourcePokerCard.Placeholder;
SpellCard.h = ResourcePokerCard.h;
SpellCard.w = ResourcePokerCard.w;

//------------------------------------------------------------------------------
// Star
//------------------------------------------------------------------------------

function Star() {
  return (
    <GridItem
      colSpan={2}
      h={0}
      justifyItems="center"
      position="relative"
      w="full"
    >
      <Box position="absolute" transform="translateY(-50%)">
        <svg height={starSize} viewBox="0 0 100 100" width={starSize}>
          <polygon
            fill={PokerCard.separatorColor}
            points="50,0 51.5,48.5 100,50 51.5,51.5 50,100 48.5,51.5 0,50 48.5,48.5"
          />
        </svg>
      </Box>
    </GridItem>
  );
}

const starSize = `${PokerCard.remToIn(4)}in`;

// ------------------------------------------------------------------------------
// I18n Context
// ------------------------------------------------------------------------------

const i18nContext = {
  casting_time: {
    en: "Casting Time",
    it: "Tempo di Lancio",
  },
  components: {
    en: "Components",
    it: "Componenti",
  },
  duration: {
    en: "Duration",
    it: "Durata",
  },
  range: {
    en: "Range",
    it: "Gittata",
  },
};
