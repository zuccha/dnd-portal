import {
  Box,
  Em,
  GridItem,
  type GridItemProps,
  HStack,
  SimpleGrid,
  type SimpleGridProps,
  Span,
  type StackProps,
  VStack,
} from "@chakra-ui/react";
import { type ReactNode } from "react";
import RichText from "~/ui/rich-text";

//------------------------------------------------------------------------------
// Album Card
//------------------------------------------------------------------------------

export type AlbumCardProps = StackProps;

export default function AlbumCard({ children, ...props }: AlbumCardProps) {
  return (
    <VStack
      borderRadius={5}
      className="light"
      color="fg"
      fontFamily="Lato"
      fontSize={size4}
      gap={0}
      h={cardH}
      lineHeight={1.2}
      overflow="hidden"
      shadow="sm"
      w={cardW}
      {...props}
    >
      {children}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Album Card Caption
//------------------------------------------------------------------------------

type AlbumCardCaptionProps = StackProps;

function AlbumCardCaption(props: AlbumCardCaptionProps) {
  return (
    <HStack
      align="flex-start"
      justify="space-between"
      px={size4}
      py={size2}
      w="full"
      {...props}
    />
  );
}

//------------------------------------------------------------------------------
// Album Card Description
//------------------------------------------------------------------------------

type AlbumCardDescriptionProps = Omit<StackProps, "children"> & {
  description: string;
};

function AlbumCardDescription({
  description,
  ...rest
}: AlbumCardDescriptionProps) {
  return (
    <VStack
      align="flex-start"
      gap={size1}
      px={size4}
      py={size3}
      w="full"
      {...rest}
    >
      {description.split("\n").map((paragraph, i) => (
        <RichText key={i} patterns={patterns} text={paragraph} />
      ))}
    </VStack>
  );
}

const patterns = [
  {
    regex: /##(.+?)##/,
    render: (val: ReactNode) => <Span fontSize={size5}>{val}</Span>,
  },
  {
    regex: /\*\*(.+?)\*\*/,
    render: (val: ReactNode) => <Span fontWeight="bold">{val}</Span>,
  },
  {
    regex: /_(.+?)_/,
    render: (val: ReactNode) => <Em>{val}</Em>,
  },
];

//------------------------------------------------------------------------------
// Album Card Header
//------------------------------------------------------------------------------

type AlbumCardHeaderProps = StackProps;

function AlbumCardHeader(props: AlbumCardHeaderProps) {
  return (
    <HStack
      align="flex-start"
      borderBottomWidth={size0}
      borderColor="border.emphasized"
      fontSize={size6}
      fontWeight="bold"
      position="relative"
      px={size4}
      py={size3}
      w="full"
      {...props}
    />
  );
}

//------------------------------------------------------------------------------
// Album Card Info
//------------------------------------------------------------------------------

type AlbumCardInfoProps = SimpleGridProps;

function AlbumCardInfo(props: AlbumCardInfoProps) {
  return (
    <SimpleGrid
      gapX={size3}
      gapY={size1}
      px={size4}
      py={size3}
      templateColumns="max-content 1fr"
      w="full"
      {...props}
    />
  );
}

//------------------------------------------------------------------------------
// Album Card Info Cell
//------------------------------------------------------------------------------

type AlbumCardInfoCellProps = {
  children: ReactNode;
  label: string;
};

function AlbumCardInfoCell({ children, label }: AlbumCardInfoCellProps) {
  return (
    <>
      <GridItem color="fg.muted">{label}</GridItem>
      {children}
    </>
  );
}

//------------------------------------------------------------------------------
// Album Card Info Separator
//------------------------------------------------------------------------------

type AlbumCardInfoSeparatorProps = GridItemProps;

function AlbumCardInfoSeparator(props: AlbumCardInfoSeparatorProps) {
  return (
    <GridItem
      borderColor="border.emphasized"
      borderTopWidth={size0}
      colSpan={2}
      mx={`-${size4}`}
      my={size1}
      {...props}
    />
  );
}

//------------------------------------------------------------------------------
// Album Card Separator H
//------------------------------------------------------------------------------

function AlbumCardSeparatorH() {
  return (
    <Box borderColor="border.emphasized" borderTopWidth={size0} w="full" />
  );
}

//------------------------------------------------------------------------------
// Album Card Separator V
//------------------------------------------------------------------------------

function AlbumCardSeparatorV() {
  return (
    <Box borderColor="border.emphasized" borderRightWidth={size0} h="full" />
  );
}

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const cardH = "3.5in";
const cardW = "2.5in";

const size0 = `${(3.5 * 0.0625) / 28}in`;
const size1 = `${(3.5 * 0.25) / 28}in`;
const size2 = `${(3.5 * 0.375) / 28}in`;
const size3 = `${(3.5 * 0.5) / 28}in`;
const size4 = `${(3.5 * 0.75) / 28}in`;
const size5 = `${(3.5 * 0.875) / 28}in`;
const size6 = `${(3.5 * 1) / 28}in`;

AlbumCard.Caption = AlbumCardCaption;
AlbumCard.Description = AlbumCardDescription;
AlbumCard.Header = AlbumCardHeader;
AlbumCard.Info = AlbumCardInfo;
AlbumCard.InfoCell = AlbumCardInfoCell;
AlbumCard.InfoSeparator = AlbumCardInfoSeparator;
AlbumCard.SeparatorH = AlbumCardSeparatorH;
AlbumCard.SeparatorV = AlbumCardSeparatorV;

AlbumCard.height = 3.5;
AlbumCard.width = 2.5;

AlbumCard.cardH = cardH;
AlbumCard.cardW = cardW;

AlbumCard.size0 = size0;
AlbumCard.size1 = size1;
AlbumCard.size2 = size2;
AlbumCard.size3 = size3;
AlbumCard.size4 = size4;
AlbumCard.size5 = size5;
AlbumCard.size6 = size6;
