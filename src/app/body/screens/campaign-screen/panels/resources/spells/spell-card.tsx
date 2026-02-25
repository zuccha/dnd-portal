import {
  Box,
  Center,
  GridItem,
  SimpleGrid,
  Span,
  VStack,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
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
                <Indicator color={palette[700]} position="left">
                  <RitualSvg />
                  {/* {t("ritual")} */}
                </Indicator>
              )}
            </Cell>
            <Cell label={t("range")} value={range} />
            <Star />
            <Cell label={t("components")} value={components} />
            <Cell label={t("duration")} value={duration}>
              {localizedResource._raw.concentration && (
                <Indicator color={palette[700]} position="right">
                  <ConcentrationSvg />
                  {/* {t("concentration")} */}
                </Indicator>
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
          pb={PokerCard.px1}
          position="absolute"
          rounded="70%"
          top={`-${PokerCard.rem1500}`}
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
// Indicator
//------------------------------------------------------------------------------

type IndicatorProps = {
  color: string;
  children: ReactNode;
  position: "left" | "right";
};

function Indicator({ color, children, position }: IndicatorProps) {
  const offsetX = PokerCard.rem0375;
  const translateX = position === "left" ? `-${offsetX}` : offsetX;
  return (
    <Center
      borderColor={color}
      borderRadius="full"
      borderWidth={PokerCard.px2}
      color={color}
      fontFamily="Fira Mono"
      fontSize={PokerCard.rem0750}
      fontWeight="bold"
      h={indicatorContainerSize}
      left={position === "left" ? 0 : undefined}
      position="absolute"
      right={position === "right" ? 0 : undefined}
      top="50%"
      transform={`translate(${translateX}, -50%)`}
      w={indicatorContainerSize}
    >
      {children}
    </Center>
  );
}

const indicatorContainerSize = `${PokerCard.remToIn(1.4)}in`;
const indicatorSize = `${PokerCard.remToIn(1)}in`;

function ConcentrationSvg() {
  return (
    <svg height={indicatorSize} viewBox="0 5 100 100" width={indicatorSize}>
      <path
        d="m41.969 19.391c0-4.4219 3.6094-8.0312 8.0312-8.0312s8.0312 3.6094 8.0312 8.0312v5.75c0 4.4219-3.6094 8.0312-8.0312 8.0312s-8.0312-3.6094-8.0312-8.0312zm-27.188 62.719c3.8438-2.8906 7.3125-5.9688 10.312-9.1875 8.75 0.125 17.031 2.7969 23.969 7.7031 3.6094 2.5469 6.7812 5.2344 9.5 8.0156h-31.078c-6.9375 0-11.188-2.2188-12.703-6.5312zm57.734 6.5312h-9.7031c-2.8125-3.1875-6.2031-6.2656-10.094-9.1875 3.0781-1.9531 6.4062-3.5156 9.9375-4.5938 3.9219-1.2344 8.0469-1.8906 12.25-1.9531 3 3.2344 6.4844 6.3125 10.312 9.1875-1.5312 4.3281-5.7656 6.5312-12.703 6.5312zm18.766-7.4375c-0.25 0.15625-1.1406 0.625-2.0938-0.0625-0.375-0.26562-0.78125-0.54688-1.1875-0.85938-4.25-3.1094-8.0312-6.4688-11.234-9.9844-4.2031-4.5625-9.4062-11.438-11.422-16.984-0.20312-0.5625-0.71875-0.95312-1.3125-1.0156-0.60938-0.0625-1.1719 0.21875-1.4844 0.73438-0.15625 0.25-3.7812 6.2969-0.1875 18.703-0.20312 0.0625-0.40625 0.10938-0.60938 0.17188-4.2031 1.2969-8.125 3.2031-11.734 5.625-3.7969-2.5625-7.9531-4.5156-12.328-5.8125 3.5781-12.406-0.03125-18.438-0.1875-18.688-0.3125-0.5-0.89062-0.78125-1.4844-0.73438-0.59375 0.0625-1.1094 0.45312-1.3125 1.0156-2.0312 5.5625-7.2344 12.422-11.422 16.984-3.2031 3.5156-6.9844 6.875-11.234 10-0.40625 0.29688-0.79688 0.57812-1.2031 0.85938-0.9375 0.67188-1.8281 0.20312-2.0781 0.046875s-1.0781-0.78125-0.875-1.9375l0.9375-5.3906c0.14062-0.8125 0.78125-1.4531 1.5938-1.5625 0.15625-0.015625 0.32812-0.078125 0.46875-0.14062l5.1562-2.5469c0.42188-0.26562 10.188-6.4844 13.016-20.672 1.6875-8.4062 8.6406-10.312 10.734-10.688 1.7344-0.3125 3.1562-1.4688 3.8125-3.0625l0.29688-0.75c1.7656 1.1719 3.875 1.8438 6.1406 1.8438s4.375-0.6875 6.125-1.8438l0.29688 0.75c0.64062 1.5938 2.0625 2.7344 3.8281 3.0625 2.0938 0.375 9.0469 2.2656 10.734 10.688 2.8438 14.203 12.609 20.422 13.156 20.75l5.0156 2.4844c0.15625 0.078125 0.3125 0.125 0.46875 0.14062 0.8125 0.10938 1.4531 0.73438 1.5938 1.5625l0.9375 5.3906c0.20312 1.1719-0.625 1.7812-0.875 1.9375z"
        fill="currentColor"
      />
    </svg>
  );
}

function RitualSvg() {
  return (
    <svg height={indicatorSize} viewBox="0 0 100 100" width={indicatorSize}>
      <path
        d="m39.125 83.219-10.969 7.4062c-0.73438 0.48438-1.6875 0.375-2.2969-0.25l-10.875-11.562c-0.375-0.39062-0.54688-0.92188-0.46875-1.4688 0.078125-0.53125 0.375-1 0.84375-1.2812l10.203-6.1562c5.5-3.8281 5.5625-12.062 5.1719-20.188-0.39062-7.9688 1.2031-12.531 1.2031-12.531l12.234-27.688c0.34375-0.82812 1.1562-1.375 2.0625-1.375 0.65625 0 1.2656 0.28125 1.6875 0.78125 0.26562 0.29688 0.42188 0.65625 0.48438 1.0156-0.015625 0.28125 0 0.5625 0 0.84375l-4.2812 24.375c-2.7031 0.60938-4.7188 3.0312-4.7188 5.9062v12c0 0.85938 0.70312 1.5625 1.5625 1.5625s1.5625-0.70312 1.5625-1.5625v-12c0-1.6094 1.2969-2.9219 2.9062-2.9375h0.046875c1.6094 0 2.9062 1.3281 2.9062 2.9375v11.859c-0.03125 0.35938-0.28125 3.6406-0.015625 8.0625-0.46875 7.3125-2.3906 17.766-9.2969 22.266zm45.875-4.4219-10.875 11.562c-0.59375 0.64062-1.5625 0.75-2.2969 0.25l-10.984-7.4219c-6.875-4.4844-8.7969-14.906-9.2656-22.25 0.26562-4.3906 0-7.6094-0.015625-7.9219v-12c0-1.6094 1.2969-2.9219 2.9062-2.9375h0.046875c1.6094 0 2.9062 1.3281 2.9062 2.9375v12c0 0.85938 0.70312 1.5625 1.5625 1.5625s1.5625-0.70312 1.5625-1.5625v-12c0-2.875-2.0156-5.2969-4.7188-5.9062l-4.2812-24.359c0.015625-0.29688 0.046875-0.57812 0.015625-0.875 0.078125-0.35938 0.23438-0.70312 0.48438-1 0.4375-0.5 1.0312-0.78125 1.6875-0.78125 0.90625 0 1.7188 0.54688 2.0781 1.4062l12.188 27.562s1.625 4.6094 1.2344 12.625c-0.39062 8.1094-0.32812 16.359 5.25 20.234l10.109 6.1094c0.46875 0.28125 0.76562 0.75 0.84375 1.2812s-0.09375 1.0625-0.46875 1.4688z"
        fill="currentColor"
      />
    </svg>
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
