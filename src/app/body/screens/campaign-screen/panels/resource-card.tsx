import { HStack, Separator, Span, VStack } from "@chakra-ui/react";
import { type ReactNode } from "react";
import Checkbox from "../../../../../ui/checkbox";
import RichText from "../../../../../ui/rich-text";

//------------------------------------------------------------------------------
// Resource Card
//------------------------------------------------------------------------------

export type ResourceCardProps = {
  children: ReactNode;
};

export default function ResourceCard({ children }: ResourceCardProps) {
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
    >
      {children}
    </VStack>
  );
}

ResourceCard.Caption = ResourceCardCaption;
ResourceCard.Description = ResourceCardDescription;
ResourceCard.Header = ResourceCardHeader;
ResourceCard.Title = ResourceCardTitle;

//------------------------------------------------------------------------------
// Resource Card Header
//------------------------------------------------------------------------------

function ResourceCardHeader({
  children,
  onToggleSelection,
  selected,
}: {
  children?: ReactNode;
  onToggleSelection: () => void;
  selected: boolean;
}) {
  return (
    <HStack
      fontWeight="bold"
      justify="space-between"
      position="relative"
      px={3}
      py={1}
      w="full"
    >
      <HStack>{children}</HStack>

      <Checkbox
        checked={selected}
        onValueChange={onToggleSelection}
        size="sm"
      />
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Resource Card Title
//------------------------------------------------------------------------------

function ResourceCardTitle({ children }: { children: ReactNode }) {
  return <Span py={1}>{children}</Span>;
}

//------------------------------------------------------------------------------
// Resource Card Caption
//------------------------------------------------------------------------------

function ResourceCardCaption({ children }: { children: ReactNode }) {
  return (
    <HStack
      bgColor="bg.subtle"
      fontSize="xs"
      justify="space-between"
      px={3}
      py={1}
      w="full"
    >
      {children}
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Resource Card Description
//------------------------------------------------------------------------------

function ResourceCardDescription({ description }: { description: string }) {
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
    >
      {description.split("\n").map((paragraph, i) => (
        <RichText key={i} patterns={patterns} text={paragraph} />
      ))}
    </VStack>
  );
}

const patterns = [
  {
    regex: /\*\*(.+?)\*\*/,
    render: (val: ReactNode) => <Span fontWeight="bold">{val}</Span>,
  },
  {
    regex: /_(.+?)_/,
    render: (val: ReactNode) => <Span fontStyle="italic">{val}</Span>,
  },
];
