import {
  Box,
  Em,
  HStack,
  Span,
  type StackProps,
  VStack,
} from "@chakra-ui/react";
import { type ReactNode, useMemo } from "react";
import RichText from "~/ui/rich-text";
import type { Palette } from "~/utils/palette";

const separatorColor = "#3F3F46";

//------------------------------------------------------------------------------
// Sizes
//------------------------------------------------------------------------------

const cardH = "3.5in";
const cardW = "2.5in";

const px1 = `${(3.5 * 0.0625) / 28}in`;
const px2 = `${(3.5 * 0.125) / 28}in`;
const px3 = `${(3.5 * 0.1875) / 28}in`;
const rem0125 = `${(3.5 * 0.125) / 28}in`;
const rem0250 = `${(3.5 * 0.25) / 28}in`;
const rem0375 = `${(3.5 * 0.375) / 28}in`;
const rem0500 = `${(3.5 * 0.5) / 28}in`;
const rem0625 = `${(3.5 * 0.625) / 28}in`;
const rem0750 = `${(3.5 * 0.75) / 28}in`;
const rem0875 = `${(3.5 * 0.875) / 28}in`;
const rem1000 = `${(3.5 * 1.0) / 28}in`;
const rem1125 = `${(3.5 * 1.125) / 28}in`;
const rem1250 = `${(3.5 * 1.25) / 28}in`;
const rem1375 = `${(3.5 * 1.375) / 28}in`;
const rem1500 = `${(3.5 * 1.5) / 28}in`;
const rem1625 = `${(3.5 * 1.625) / 28}in`;

//------------------------------------------------------------------------------
// Frame
//------------------------------------------------------------------------------

export type FrameProps = StackProps & {
  descriptor?: string;
  name: string;
  palette: Palette;
  pageIndicator: string;
  sourceName: string;
  sourcePage: string;
};

function Frame({
  children,
  descriptor,
  name,
  palette,
  pageIndicator,
  sourceName,
  sourcePage,
  ...rest
}: FrameProps) {
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
      h={cardH}
      lineHeight={1.2}
      overflow="hidden"
      shadow="sm"
      w={cardW}
      {...rest}
    >
      <VStack gap={0} lineHeight={0.9} px={rem0750} textAlign="center">
        <Span fontFamily="Mr Eaves Alt" fontSize={rem1625} pt={rem0750}>
          {name}
        </Span>
        {descriptor && (
          <Span fontSize={rem1000} fontStyle="italic" pt={rem0375}>
            {descriptor}
          </Span>
        )}
      </VStack>

      <VStack flex={1} gap={rem0750} overflow="hidden" w="full">
        {children}
      </VStack>

      <HStack
        bgColor={palette["700"]}
        color="white"
        columns={3}
        fontFamily="Mr Eaves Alt"
        fontSize={rem0750}
        gap={0}
        px={rem0750}
        py={rem0500}
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
        <Span fontSize={rem0875} textAlign="center" w="20%">
          {pageIndicator}
        </Span>
        <Span
          overflow="hidden"
          textAlign="right"
          textOverflow="ellipsis"
          w="40%"
        >
          D&D 5e '24
        </Span>
      </HStack>
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
  return (
    <HStack gap={0}>
      <VStack
        bgColor={palette[800]}
        borderColor={palette[800]}
        borderWidth={PokerCard.px1}
        clipPath={`polygon(0 50%, ${PokerCard.rem1000} 0, 100% 0, 100% 100%, ${PokerCard.rem1000} 100%)`}
        color={palette[800]}
        gap={0}
        py={PokerCard.rem0250}
        transform={`translateX(calc(97%))`}
        w={PokerCard.rem1500}
      >
        <Span>{"\u0200b"}</Span>
        <Span>{"\u0200b"}</Span>
      </VStack>

      <VStack
        align="flex-end"
        bgColor={palette[50]}
        borderColor={palette[800]}
        borderYWidth={PokerCard.px1}
        clipPath={`polygon(0 50%, ${PokerCard.rem1000} 0, 100% 0, 100% 100%, ${PokerCard.rem1000} 100%)`}
        gap={0}
        mr={`-${PokerCard.rem0750}`}
        pl={PokerCard.rem1500}
        pr={PokerCard.rem0750}
        py={PokerCard.rem0250}
      >
        <Span fontStyle="italic" fontWeight="bold">
          {label}
        </Span>
        <Span>{value}</Span>
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
  const patterns = useMemo(
    () => [
      {
        regex: /##(.+?)##/,
        render: (val: ReactNode) => (
          <Span color={palette["800"]} fontWeight="bold">
            {val}
          </Span>
        ),
      },
      {
        regex: /\*\*(.+?)\*\*/,
        render: (val: ReactNode) => <Span fontWeight="bold">{val}</Span>,
      },
      {
        regex: /_(.+?)_/,
        render: (val: ReactNode) => <Em>{val}</Em>,
      },
    ],
    [palette],
  );

  return (
    <VStack
      align="flex-start"
      flex={1}
      gap={rem0250}
      lineHeight={1.1}
      px={rem1000}
      w="full"
    >
      {children.split(/[\n\r]/).map((paragraph, paragraphIndex) => (
        <RichText key={paragraphIndex} patterns={patterns} text={paragraph} />
      ))}
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
  const patterns = useMemo(
    () => [
      {
        regex: /\*\*(.+?)\*\*/,
        render: (val: ReactNode) => <Span fontWeight="bold">{val}</Span>,
      },
      {
        regex: /_(.+?)_/,
        render: (val: ReactNode) => <Em>{val}</Em>,
      },
    ],
    [],
  );

  return (
    <VStack align="flex-start" lineHeight={1} px={rem1000} w="full">
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
          <RichText key={paragraphIndex} patterns={patterns} text={paragraph} />
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
  const patterns = useMemo(
    () => [
      {
        regex: /\*\*(.+?)\*\*/,
        render: (val: ReactNode) => <Span fontWeight="bold">{val}</Span>,
      },
      {
        regex: /_(.+?)_/,
        render: (val: ReactNode) => <Em>{val}</Em>,
      },
    ],
    [],
  );

  return (
    <VStack
      align="flex-start"
      bgColor={palette[50]}
      fontStyle="italic"
      gap={0}
      lineHeight={1}
      px={rem1000}
      py={rem0500}
      w="full"
    >
      {children.split("\n").map((paragraph, paragraphIndex) => (
        <RichText key={paragraphIndex} patterns={patterns} text={paragraph} />
      ))}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Separator
//------------------------------------------------------------------------------

function Separator(props: StackProps) {
  return (
    <Box px={rem0500} w="full" {...props}>
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
// Poker Card
//------------------------------------------------------------------------------

const PokerCard = {
  Arrow,
  Details,
  Entry,
  Frame,
  Info,
  Separator,

  cardH: 3.5,
  cardW: 2.5,
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
  separatorColor,
};

export default PokerCard;
