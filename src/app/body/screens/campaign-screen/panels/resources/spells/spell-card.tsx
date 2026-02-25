import {
  Box,
  Center,
  GridItem,
  HStack,
  SimpleGrid,
  Span,
  type StackProps,
  VStack,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedSpell } from "~/models/resources/spells/localized-spell";
import type { Spell } from "~/models/resources/spells/spell";
import { useBleed } from "~/ui/bleed-context";
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
  const bleed = useBleed();

  const casting_time = localizedResource.casting_time;
  const range = localizedResource.range;
  const components = localizedResource.components;
  const duration = localizedResource.duration_with_concentration;

  const castingTimeColor =
    (
      localizedResource._raw.casting_time === "bonus_action" ||
      localizedResource._raw.casting_time === "reaction"
    ) ?
      palette[800]
    : undefined;

  return (
    <ResourcePokerCard
      afterDescriptor={
        localizedResource.character_classes ?
          <Center
            fontFamily="Mr Eaves"
            fontSize={PokerCard.rem0750}
            fontStyle="normal"
            textTransform="uppercase"
          >
            {localizedResource.character_classes}
          </Center>
        : null
      }
      beforeDetails={
        <>
          <SimpleGrid columns={2} gap={0} px={PokerCard.rem1000} w="full">
            <Cell
              color={castingTimeColor}
              label={t("casting_time")}
              value={casting_time}
            >
              {localizedResource._raw.ritual && (
                <NoteLeft bgColor={palette[700]} bleedX={bleed.x}>
                  {t("ritual")}
                </NoteLeft>
              )}
            </Cell>
            <Cell label={t("range")} value={range} />
            <Star />
            <Cell label={t("components")} value={components} />
            <Cell label={t("duration")} value={duration}>
              {localizedResource._raw.concentration && (
                <NoteRight bgColor={palette[700]} bleedX={bleed.x}>
                  {t("concentration")}
                </NoteRight>
              )}
            </Cell>
          </SimpleGrid>

          <PokerCard.Separator />

          {localizedResource.info && (
            <PokerCard.Info palette={palette}>
              {localizedResource.info}
            </PokerCard.Info>
          )}
        </>
      }
      footer={
        <Center
          aspectRatio={1.4}
          bgColor="gray.200"
          borderColor={palette[700]}
          borderWidth={PokerCard.rem0250}
          color={palette[700]}
          fontFamily="Fira Mono"
          fontSize={PokerCard.rem1125}
          fontWeight="bold"
          h={`${PokerCard.remToIn(2.2)}in`}
          left="50%"
          position="absolute"
          rounded="70%"
          top="-0.18in"
          transform="translateX(-50%)"
        >
          {localizedResource.level}
        </Center>
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
// Cell
//------------------------------------------------------------------------------

type CellProps = {
  children?: ReactNode;
  color?: string;
  label: string;
  value: string;
};

function Cell({ children, color, label, value, ...rest }: CellProps) {
  return (
    <VStack gap={0} position="relative" {...rest}>
      <Span fontFamily="Mr Eaves Alt" fontSize={PokerCard.rem1000}>
        {label}
      </Span>
      <Span
        color={color}
        fontWeight={color ? "bold" : undefined}
        lineHeight={0.9}
        px={PokerCard.rem0250}
        textAlign="center"
      >
        {value}
      </Span>

      {children}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Note
//------------------------------------------------------------------------------

type NoteProps = StackProps & {
  bgColor: string;
  bleedX: number;
  children: ReactNode;
};

function Note({ bgColor, bleedX, children, ...rest }: NoteProps) {
  return (
    <HStack
      bgColor={bgColor}
      color="white"
      fontFamily="Fira Mono"
      fontSize={PokerCard.rem0750}
      fontWeight="bold"
      position="absolute"
      py={PokerCard.rem0250}
      top="50%"
      transform="translateY(-50%)"
      w={`${PokerCard.remToIn(1.5) + bleedX}in`}
      {...rest}
    >
      {children}
    </HStack>
  );
}

function NoteLeft(props: NoteProps) {
  return (
    <Note
      {...props}
      borderRightRadius="full"
      left={0}
      ml={`-${PokerCard.rem1000}`}
      pl={`${PokerCard.remToIn(0.375) + props.bleedX}in`}
    />
  );
}

function NoteRight(props: NoteProps) {
  return (
    <Note
      {...props}
      borderLeftRadius="full"
      justify="flex-end"
      mr={`-${PokerCard.rem1000}`}
      pr={`${PokerCard.remToIn(0.375) + props.bleedX}in`}
      right={0}
    />
  );
}

//------------------------------------------------------------------------------
// Star
//------------------------------------------------------------------------------

function Star() {
  return (
    <GridItem
      colSpan={2}
      h={PokerCard.rem0250}
      justifyItems="center"
      position="relative"
      w="full"
    >
      <Box position="absolute" top="50%" transform="translateY(-50%)">
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

const starSize = `${PokerCard.remToIn(3.5)}in`;

// ------------------------------------------------------------------------------
// I18n Context
// ------------------------------------------------------------------------------

const i18nContext = {
  casting_time: {
    en: "Casting Time",
    it: "Lancio",
  },
  components: {
    en: "Components",
    it: "Componenti",
  },
  concentration: {
    en: "C",
    it: "C",
  },
  duration: {
    en: "Duration",
    it: "Durata",
  },
  range: {
    en: "Range",
    it: "Gittata",
  },
  ritual: {
    en: "R",
    it: "R",
  },
};
