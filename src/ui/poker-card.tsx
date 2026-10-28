import { Box, HStack, Span, type StackProps, Text, VStack } from "@chakra-ui/react";
import { Fragment, type ReactNode } from "react";
import RichText, { type RichTextPattern } from "~/ui/rich-text";
import { renderRichTextBlocks } from "~/ui/rich-text-block-pattern";
import { createRichTextTableBlockPattern } from "~/ui/rich-text-table-block-pattern";
import type { Palette } from "~/utils/palette";
import { resourceDetailRoute } from "../navigation/routes";
import { type BleedCorner, useBleed } from "./bleed-context";
import RouterLink from "./router-link";
import type { LocalizedResourceLink } from "../models/resources/localized-resource";
import type { ResourceKind } from "../models/types/resource-kind";

//------------------------------------------------------------------------------
// Sizes
//------------------------------------------------------------------------------

const separatorColor = "#3F3F46";

const cardH = 3.46;
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
const rem0700 = `${remToIn(0.7)}in`;
const rem0750 = `${remToIn(0.75)}in`;
const rem0875 = `${remToIn(0.875)}in`;
const rem1000 = `${remToIn(1)}in`;
const rem1100 = `${remToIn(1.1)}in`;
const rem1125 = `${remToIn(1.125)}in`;
const rem1250 = `${remToIn(1.25)}in`;
const rem1375 = `${remToIn(1.375)}in`;
const rem1500 = `${remToIn(1.5)}in`;
const rem1625 = `${remToIn(1.625)}in`;
const rem2000 = `${remToIn(2)}in`;

//------------------------------------------------------------------------------
// Frame
//------------------------------------------------------------------------------

export type FrameProps = StackProps & {
  compact?: boolean;
  descriptor: ReactNode;
  footer?: ReactNode;
  name: ReactNode;
  onNameClick?: () => void;
  palette: Palette;
  pageIndicator: string;
  sourceName: string;
  sourcePage: string;
  sourceVersion: string;
};

function Frame({
  bgColor,
  compact,
  children,
  descriptor,
  footer,
  name,
  onNameClick,
  palette,
  pageIndicator,
  sourceName,
  sourcePage,
  sourceVersion,
  ...rest
}: FrameProps) {
  const bleed = useBleed();
  const bgImage = `radial-gradient(circle, {colors.gray.50} 0%, {colors.gray.100} 50%, {colors.gray.200} 100%)`;
  const cardName = onNameClick ? (
    <Span
      as="button"
      _hover={{ textDecoration: "underline" }}
      cursor="pointer"
      fontWeight="bold"
      onClick={(e) => {
        e.stopPropagation();
        onNameClick();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      {name}
    </Span>
  ) : (
    <Span fontWeight="bold">{name}</Span>
  );

  return (
    <VStack
      bgColor={bgColor}
      bgImage={bgColor ? undefined : bgImage}
      bgPos="center"
      bgRepeat="no-repeat"
      bgSize="100% 100%"
      borderRadius={5}
      className="light"
      color="black"
      fontFamily="Bookinsanity"
      fontSize={rem0875}
      gap={0}
      h={`${cardH + 2 * bleed.y}in`}
      lineHeight={1.2}
      overflow="hidden"
      position="relative"
      w={`${cardW + 2 * bleed.x}in`}
      {...rest}
    >
      {bleed.corner && <BleedGuide {...bleed} corner={bleed.corner} />}

      {compact ? (
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
          {cardName}
          <Span whiteSpace="nowrap">{pageIndicator}</Span>
        </HStack>
      ) : (
        <VStack gap={0} lineHeight={0.9} px={`${remToIn(1) + bleed.x}in`} textAlign="center">
          <HStack
            color={palette[800]}
            fontFamily="Title Wave"
            fontSize={rem1375}
            lineHeight={1.1}
            pt={`${remToIn(1) + bleed.y}in`}
          >
            {cardName}
          </HStack>
          <HStack fontSize={rem1000} fontStyle="italic" pt={rem0375}>
            {descriptor}
          </HStack>
        </VStack>
      )}

      <VStack flex={1} gap={0} overflow="hidden" w="full">
        {children}
      </VStack>

      {compact ? (
        <Span h={bleed.y} />
      ) : (
        <HStack
          bgColor={palette[700]}
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
          <Span overflow="hidden" textAlign="left" textOverflow="ellipsis" w="40%">
            {sourcePage ? `${sourceName} > ${sourcePage}` : sourceName}
          </Span>
          <Span position="relative" w="20%">
            {footer}
          </Span>
          <Span overflow="hidden" textAlign="right" textOverflow="ellipsis" w="40%">
            {sourceVersion}
          </Span>
        </HStack>
      )}
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
// Description
//------------------------------------------------------------------------------

type DescriptionProps = {
  children: string;
  palette: Palette;
  patterns?: RichTextPattern[];
};

function Description({ children, palette, patterns }: DescriptionProps) {
  const bleed = useBleed();
  const blocks = renderRichTextBlocks(children, [
    createRichTextTableBlockPattern({
      mode: "card",
      palette,
      renderCell: (value) => <RichText display="inline" patterns={patterns} text={value} />,
    }),
  ]);

  return (
    <VStack
      align="flex-start"
      flex={1}
      gap={rem0250}
      lineHeight={1.1}
      px={`${remToIn(1) + bleed.x}in`}
      w="full"
    >
      {blocks.map((block, blockIndex) =>
        block.type === "rendered" ? (
          <Fragment key={blockIndex}>{block.value}</Fragment>
        ) : (
          block.value.split(/[\n\r]/).map((paragraph, paragraphIndex) => {
            if (paragraph.trim() === "") {
              return <Box h={rem1100} key={`${blockIndex}:${paragraphIndex}`} />;
            }

            if (paragraph.startsWith("##"))
              return (
                <Span
                  borderBottomColor={palette[800]}
                  borderBottomWidth={px2}
                  color={palette[800]}
                  fontFamily="Mr Eaves Alt"
                  fontSize={rem1125}
                  fontWeight="bold"
                  key={`${blockIndex}:${paragraphIndex}`}
                  lineHeight={0.9}
                  mb={rem0125}
                  mt={rem0250}
                  w="full"
                >
                  <RichText
                    display="inline"
                    patterns={patterns}
                    text={paragraph.substring(2, paragraph.length - 2)}
                  />
                </Span>
              );

            return (
              <RichText
                hyphens="auto"
                key={`${blockIndex}:${paragraphIndex}`}
                patterns={patterns}
                text={paragraph}
              />
            );
          })
        ),
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Labeled Values
//------------------------------------------------------------------------------

type LabeledValuesProps = {
  compact?: boolean;
  fields: { label: string; value: ReactNode }[];
  palette: Palette;
};

function LabeledValues({ compact, fields, palette }: LabeledValuesProps) {
  const bleed = useBleed();
  const visibleFields = fields.filter(({ value }) => {
    if (typeof value === "string") return Boolean(value);
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== false;
  });

  if (!visibleFields.length) return null;

  return (
    <VStack
      align="flex-start"
      bgColor={`${palette[50]}99`}
      borderColor={palette[800]}
      borderYWidth={px1}
      fontSize={compact ? rem0750 : undefined}
      fontStyle="italic"
      gap={0}
      lineHeight={1}
      px={`${remToIn(1) + bleed.x}in`}
      py={rem0500}
      w="full"
    >
      {visibleFields.map(({ label, value }, index) => (
        <Text key={`${label}-${index}`} m={0}>
          <Span fontWeight="bold" mr={1.5}>
            {label}
          </Span>
          {value}
        </Text>
      ))}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Link
//------------------------------------------------------------------------------

function Link({
  children,
  id,
  kind,
  palette,
}: {
  children: ReactNode;
  id: string;
  kind: ResourceKind;
  palette: Palette;
}) {
  return (
    <RouterLink
      color={palette[800]}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      to={resourceDetailRoute(kind, id)}
    >
      {children}
    </RouterLink>
  );
}

//------------------------------------------------------------------------------
// Links
//------------------------------------------------------------------------------

function Links({
  palette,
  resources,
  separator = ", ",
}: {
  palette: Palette;
  resources: LocalizedResourceLink<ResourceKind>[];
  separator?: string;
}) {
  return resources.map(({ id, kind, name }, index) => (
    <Fragment key={`${kind}:${id}`}>
      {index > 0 && separator}
      <Link id={id} kind={kind} palette={palette}>
        {name}
      </Link>
    </Fragment>
  ));
}

//------------------------------------------------------------------------------
// Separator
//------------------------------------------------------------------------------

function Separator(props: StackProps) {
  const bleed = useBleed();

  return (
    <Box px={`${remToIn(0.5) + bleed.x}in`} w="full" {...props}>
      <svg preserveAspectRatio="none" style={{ height: px2, width: "100%" }} viewBox="0 0 100 2">
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
  Details: Description,
  Frame,
  LabeledValues,
  Link,
  Links,
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
  rem0700,
  rem0750,
  rem0875,
  rem1000,
  rem1100,
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
