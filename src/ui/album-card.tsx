import {
  HStack,
  Separator,
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

export default function AlbumCard(props: AlbumCardProps) {
  return (
    <VStack
      bgColor="bg"
      borderBottomColor="bg.inverted"
      borderLeftColor="border.emphasized"
      borderRadius={5}
      borderRightColor="border.emphasized"
      borderTopColor="bg.inverted"
      borderXWidth={1}
      borderYWidth={2}
      fontFamily="Lato"
      gap={0}
      h="28em"
      lineHeight={1.2}
      separator={<Separator w="full" />}
      w="20em"
      {...props}
    />
  );
}

AlbumCard.Caption = AlbumCardCaption;
AlbumCard.Description = AlbumCardDescription;
AlbumCard.Header = AlbumCardHeader;
AlbumCard.Info = AlbumCardInfo;
AlbumCard.InfoCell = AlbumCardInfoCell;

//------------------------------------------------------------------------------
// Album Card Caption
//------------------------------------------------------------------------------

type AlbumCardCaptionProps = StackProps;

function AlbumCardCaption(props: AlbumCardCaptionProps) {
  return (
    <HStack
      align="flex-start"
      bgColor="bg.subtle"
      fontSize="xs"
      justify="space-between"
      px={3}
      py={1}
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
      fontSize="sm"
      gap={1}
      overflow="auto"
      px={3}
      py={2}
      w="full"
      {...rest}
    >
      {description.split("\n").map((paragraph, i) => (
        <RichText key={i} text={paragraph} />
      ))}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Album Card Header
//------------------------------------------------------------------------------

type AlbumCardHeaderProps = StackProps;

function AlbumCardHeader(props: AlbumCardHeaderProps) {
  return (
    <HStack
      align="flex-start"
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
      fontSize="xs"
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
      <Span color="fg.muted">{label}</Span>
      {children}
    </>
  );
}
