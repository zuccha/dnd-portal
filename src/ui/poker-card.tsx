import { Box, HStack, Span, type StackProps, VStack } from "@chakra-ui/react";
import { type ReactNode } from "react";
import RichText from "~/ui/rich-text";
import type { Palette } from "~/utils/palette";
import { type BleedCorner, useBleed } from "./bleed-context";

const separatorColor = "#3F3F46";

//------------------------------------------------------------------------------
// Sizes
//------------------------------------------------------------------------------

const cardH = 3.48;
const cardW = 2.48;

const remToIn = (rem: number) => (cardH * rem) / 28;

const px1 = `${remToIn(0.0625)}in`;
const px2 = `${remToIn(0.125)}in`;
const px3 = `${remToIn(0.1875)}in`;
const rem0125 = `${remToIn(0.125)}in`;
const rem0250 = `${remToIn(0.25)}in`;
const rem0375 = `${remToIn(0.375)}in`;
const rem0500 = `${remToIn(0.5)}in`;
const rem0625 = `${remToIn(0.625)}in`;
const rem0750 = `${remToIn(0.75)}in`;
const rem0875 = `${remToIn(0.875)}in`;
const rem1000 = `${remToIn(1)}in`;
const rem1125 = `${remToIn(1.125)}in`;
const rem1250 = `${remToIn(1.25)}in`;
const rem1375 = `${remToIn(1.375)}in`;
const rem1500 = `${remToIn(1.5)}in`;
const rem1625 = `${remToIn(1.625)}in`;
const rem2000 = `${remToIn(1.2)}in`;

//------------------------------------------------------------------------------
// Frame
//------------------------------------------------------------------------------

export type FrameProps = StackProps & {
  compact?: boolean;
  descriptor: ReactNode;
  footer?: ReactNode;
  name: ReactNode;
  palette: Palette;
  pageIndicator: string;
  sourceName: string;
  sourcePage: string;
};

function Frame({
  compact,
  children,
  descriptor,
  footer,
  name,
  palette,
  pageIndicator,
  sourceName,
  sourcePage,
  ...rest
}: FrameProps) {
  const bleed = useBleed();
  const bgImage = `radial-gradient(circle, {colors.gray.50} 0%, {colors.gray.100} 50%, {colors.gray.200} 100%)`;

  return (
    <VStack
      bgImage={bgImage}
      bgPos="center"
      bgRepeat="no-repeat"
      bgSize="100% 100%"
      borderRadius={5}
      className="light"
      color="black"
      fontFamily="Bookinsanity"
      fontSize={rem0875}
      gap={rem0750}
      h={`${cardH + 2 * bleed.y}in`}
      lineHeight={1.2}
      overflow="hidden"
      position="relative"
      shadow="sm"
      w={`${cardW + 2 * bleed.x}in`}
      {...rest}
    >
      {bleed.corner && <BleedGuide {...bleed} corner={bleed.corner} />}

      {compact ?
        <HStack
          align="baseline"
          color={palette[800]}
          fontFamily="Title Wave"
          gap={rem1000}
          justify="space-between"
          mb={`-${rem0250}`}
          pt={`${remToIn(0.75) + bleed.y}in`}
          px={`${remToIn(1) + bleed.x}in`}
          w="full"
        >
          <Span fontWeight="bold">{name}</Span>
          <Span whiteSpace="nowrap">{pageIndicator}</Span>
        </HStack>
      : <VStack
          gap={0}
          lineHeight={0.9}
          px={`${remToIn(1) + bleed.x}in`}
          textAlign="center"
        >
          <HStack
            color={palette[800]}
            fontFamily="Title Wave"
            fontSize={rem1375}
            lineHeight={1.1}
            pt={`${remToIn(1) + bleed.y}in`}
          >
            {name}
          </HStack>
          <HStack fontSize={rem1000} fontStyle="italic" pt={rem0375}>
            {descriptor}
          </HStack>
        </VStack>
      }

      <VStack flex={1} gap={rem0750} overflow="hidden" w="full">
        {children}
      </VStack>

      {compact ?
        <Span h={bleed.y} />
      : <HStack
          bgColor={palette["700"]}
          color="white"
          fontFamily="Mr Eaves Alt"
          fontSize={rem0750}
          fontWeight="bold"
          gap={0}
          pb={`${remToIn(0.625) + bleed.y}in`}
          pt={rem0500}
          px={`${remToIn(1) + bleed.x}in`}
          textOverflow="ellipsis"
          textTransform="uppercase"
          w="full"
          whiteSpace="nowrap"
        >
          <Span
            overflow="hidden"
            textAlign="left"
            textOverflow="ellipsis"
            w="40%"
          >
            {sourcePage ? `${sourceName} > ${sourcePage}` : sourceName}
          </Span>
          <Span position="relative" w="20%">
            {footer}
          </Span>
          <Span
            overflow="hidden"
            textAlign="right"
            textOverflow="ellipsis"
            w="40%"
          >
            D&D Portal
          </Span>
        </HStack>
      }
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Arrow
//------------------------------------------------------------------------------

type ArrowProps = {
  label: string;
  palette: Palette;
  value: string;
};

function Arrow({ label, palette, value }: ArrowProps) {
  const bleed = useBleed();

  return (
    <HStack gap={0}>
      <VStack
        bgColor={palette[800]}
        borderColor={palette[800]}
        borderWidth={px1}
        clipPath={`polygon(0 50%, ${rem1000} 0, 100% 0, 100% 100%, ${rem1000} 100%)`}
        color={palette[800]}
        gap={0}
        py={rem0250}
        transform={`translateX(calc(97%))`}
        w={rem1500}
      >
        <Span>{"\u0200b"}</Span>
        <Span>{"\u0200b"}</Span>
      </VStack>

      <VStack
        align="flex-end"
        bgColor={palette[50]}
        borderColor={palette[800]}
        borderYWidth={px1}
        clipPath={`polygon(0 50%, ${rem1000} 0, 100% 0, 100% 100%, ${rem1000} 100%)`}
        gap={0}
        mr={`-${rem1000}`}
        pl={rem1500}
        pr={`${remToIn(1) + bleed.x}in`}
        py={rem0250}
      >
        <Span fontStyle="italic" fontWeight="bold">
          {label}
        </Span>
        <Span fontFamily="Mr Eaves Alt">{value}</Span>
      </VStack>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Details
//------------------------------------------------------------------------------

type DetailsProps = {
  children: string;
  palette: Palette;
};

function Details({ children, palette }: DetailsProps) {
  const bleed = useBleed();

  return (
    <VStack
      align="flex-start"
      flex={1}
      gap={rem0250}
      lineHeight={1.1}
      px={`${remToIn(1) + bleed.x}in`}
      w="full"
    >
      {children.split(/[\n\r]/).map((paragraph, paragraphIndex) =>
        paragraph.startsWith("##") ?
          <Span
            borderBottomColor={palette[800]}
            borderBottomWidth={px2}
            color={palette[800]}
            fontFamily="Mr Eaves Alt"
            fontSize={rem1125}
            fontWeight="bold"
            key={paragraphIndex}
            mb={rem0125}
            w="full"
          >
            {paragraph.substring(2, paragraph.length - 2)}
          </Span>
        : <RichText hyphens="auto" key={paragraphIndex} text={paragraph} />,
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Entry
//------------------------------------------------------------------------------

type EntryProps = {
  children: string;
  label: string;
  palette: Palette;
};

function Entry({ children, label, palette }: EntryProps) {
  const bleed = useBleed();
  const px = `${remToIn(1) + bleed.x}in`;

  return (
    <VStack align="flex-start" lineHeight={1} px={px} w="full">
      <VStack
        align="flex-start"
        borderColor={palette["800"]}
        borderLeftWidth={px3}
        gap={0}
        pl={rem0500}
        w="full"
      >
        <Span color={palette["800"]} fontWeight="bold">
          {label}
        </Span>
        {children.split("\n").map((paragraph, paragraphIndex) => (
          <RichText key={paragraphIndex} text={paragraph} />
        ))}
      </VStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Info
//------------------------------------------------------------------------------

type InfoProps = {
  children: string;
  palette: Palette;
};

function Info({ children, palette }: InfoProps) {
  const bleed = useBleed();

  return (
    <VStack
      align="flex-start"
      bgColor={`${palette[50]}99`}
      borderColor={palette[800]}
      borderYWidth={px1}
      fontStyle="italic"
      gap={0}
      lineHeight={1}
      px={`${remToIn(1) + bleed.x}in`}
      py={rem0500}
      w="full"
    >
      {children.split("\n").map((paragraph, paragraphIndex) => (
        <RichText key={paragraphIndex} text={paragraph} />
      ))}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Separator
//------------------------------------------------------------------------------

function Separator(props: StackProps) {
  const bleed = useBleed();

  return (
    <Box px={`${remToIn(0.5) + bleed.x}in`} w="full" {...props}>
      <svg
        preserveAspectRatio="none"
        style={{ height: px2, width: "100%" }}
        viewBox="0 0 100 2"
      >
        <polygon fill={separatorColor} points="0,1 50,0 100,1 50,2" />
      </svg>
    </Box>
  );
}

//------------------------------------------------------------------------------
// Bleed Guide
//------------------------------------------------------------------------------

type BleedGuideProps = {
  corner: BleedCorner;
  x: number;
  y: number;
};

function BleedGuide({ corner, x, y }: BleedGuideProps) {
  const length = `${corner.length}in`;
  const cornerProps = { borderColor: corner.color, h: length, w: length };

  return (
    <VStack
      h="full"
      justify="space-between"
      position="absolute"
      px={`calc(${x}in - 1px)`}
      py={`calc(${y}in - 1px)`}
      w="full"
    >
      <HStack justify="space-between" w="full">
        <Box {...cornerProps} borderWidth={`1px 0 0 1px`} />
        <Box {...cornerProps} borderWidth={`1px 1px 0 0`} />
      </HStack>
      <HStack justify="space-between" w="full">
        <Box {...cornerProps} borderWidth={`0 0 1px 1px`} />
        <Box {...cornerProps} borderWidth={`0 1px 1px 0`} />
      </HStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Poker Card
//------------------------------------------------------------------------------

const PokerCard = {
  Arrow,
  Details,
  Entry,
  Frame,
  Info,
  Separator,

  cardH,
  cardW,
  px1,
  px2,
  px3,
  rem0125,
  rem0250,
  rem0375,
  rem0500,
  rem0625,
  rem0750,
  rem0875,
  rem1000,
  rem1125,
  rem1250,
  rem1375,
  rem1500,
  rem1625,
  rem2000,
  remToIn,
  separatorColor,
};

export default PokerCard;
