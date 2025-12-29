import {
  Em,
  GridItem,
  type GridItemProps,
  HStack,
  Separator,
  type SeparatorProps,
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
      h="28em"
      lineHeight={1.2}
      overflow="hidden"
      shadow="sm"
      w="20em"
      {...props}
    >
      <VStack flex={1} fontSize="xs" gap={0} overflow="hidden" w="full">
        {children}
      </VStack>
    </VStack>
  );
}

AlbumCard.Caption = AlbumCardCaption;
AlbumCard.Description = AlbumCardDescription;
AlbumCard.Header = AlbumCardHeader;
AlbumCard.Info = AlbumCardInfo;
AlbumCard.InfoCell = AlbumCardInfoCell;
AlbumCard.InfoSeparator = AlbumCardInfoSeparator;
AlbumCard.Separator = AlbumCardSeparator;

//------------------------------------------------------------------------------
// Album Card Caption
//------------------------------------------------------------------------------

type AlbumCardCaptionProps = StackProps;

function AlbumCardCaption(props: AlbumCardCaptionProps) {
  return (
    <HStack
      align="flex-start"
      justify="space-between"
      px={3}
      py={1.5}
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
      flex={1}
      gap={1}
      overflow="auto"
      px={3}
      py={2}
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
    render: (val: ReactNode) => <Span fontSize="sm">{val}</Span>,
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
      fontSize="md"
      fontWeight="bold"
      position="relative"
      px={3}
      py={2}
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
      gapX={2}
      gapY={1}
      px={3}
      py={2}
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
    <GridItem bgColor="border" colSpan={2} h="1px" mx={-3} my={1} {...props} />
  );
}

//------------------------------------------------------------------------------
// Album Card Separator
//------------------------------------------------------------------------------

type AlbumCardSeparatorProps = SeparatorProps;

function AlbumCardSeparator(props: AlbumCardSeparatorProps) {
  return <Separator {...props} />;
}
