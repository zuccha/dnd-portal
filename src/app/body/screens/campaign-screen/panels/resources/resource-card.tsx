import { HStack, Separator, Span, VStack } from "@chakra-ui/react";
import { EyeClosedIcon, EyeIcon } from "lucide-react";
import { type ReactNode } from "react";
import { type CampaignRole } from "../../../../../../resources/campaign-role";
import Checkbox from "../../../../../../ui/checkbox";
import Icon from "../../../../../../ui/icon";
import Link from "../../../../../../ui/link";
import RichText from "../../../../../../ui/rich-text";

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

//------------------------------------------------------------------------------
// Resource Card Header
//------------------------------------------------------------------------------

function ResourceCardHeader({
  isGM,
  name,
  onClick,
  onToggleSelection,
  selected,
  visibility,
}: {
  isGM: boolean;
  name: string;
  onClick: () => void;
  onToggleSelection: () => void;
  selected: boolean;
  visibility: CampaignRole;
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
      {isGM ? (
        <HStack py={1}>
          <Icon
            Icon={visibility === "player" ? EyeIcon : EyeClosedIcon}
            color="fg.muted"
            size="sm"
          />
          <Link onClick={onClick}>{name}</Link>
        </HStack>
      ) : (
        <Span py={1}>{name}</Span>
      )}

      <Checkbox
        checked={selected}
        onValueChange={onToggleSelection}
        size="sm"
      />
    </HStack>
  );
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
