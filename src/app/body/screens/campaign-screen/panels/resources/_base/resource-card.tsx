import {
  Box,
  HStack,
  Separator,
  SimpleGrid,
  type SimpleGridProps,
  Span,
  VStack,
} from "@chakra-ui/react";
import { EyeClosedIcon, EyeIcon, RefreshCwIcon } from "lucide-react";
import { type ReactNode } from "react";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import { type CampaignRole } from "~/models/types/campaign-role";
import Checkbox from "~/ui/checkbox";
import Icon from "~/ui/icon";
import IconButton from "~/ui/icon-button";
import Link from "~/ui/link";
import RichText from "~/ui/rich-text";

//------------------------------------------------------------------------------
// Resource Card
//------------------------------------------------------------------------------

export type ResourceCardProps<
  R extends Resource,
  LR extends LocalizedResource<R>,
> = {
  canEdit: boolean;
  children: ReactNode;
  localizedResource: LR;
  onOpen: (resource: R) => void;
  onToggleFront?: () => void;
  onToggleSelected: () => void;
  selected: boolean;
};

export default function ResourceCard<
  R extends Resource,
  LR extends LocalizedResource<R>,
>({
  canEdit,
  children,
  localizedResource,
  onOpen,
  onToggleFront,
  onToggleSelected,
  selected,
}: ResourceCardProps<R, LR>) {
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
      <ResourceCard.Header
        canEdit={canEdit}
        name={localizedResource.name}
        onClick={() => onOpen(localizedResource._raw)}
        onToggleFront={onToggleFront}
        onToggleSelection={onToggleSelected}
        selected={selected}
        visibility={localizedResource._raw.visibility}
      />

      {children}

      <ResourceCard.Caption>
        <Span>{localizedResource.campaign}</Span>
        <Span>{localizedResource.page}</Span>
      </ResourceCard.Caption>
    </VStack>
  );
}

ResourceCard.Caption = ResourceCardCaption;
ResourceCard.Description = ResourceCardDescription;
ResourceCard.Header = ResourceCardHeader;
ResourceCard.Info = ResourceCardInfo;
ResourceCard.InfoCell = ResourceCardInfoCell;

//------------------------------------------------------------------------------
// Resource Card Header
//------------------------------------------------------------------------------

function ResourceCardHeader({
  canEdit,
  name,
  onClick,
  onToggleFront,
  onToggleSelection,
  selected,
  visibility,
}: {
  canEdit: boolean;
  name: string;
  onClick: () => void;
  onToggleFront?: () => void;
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
      {canEdit ?
        <HStack py={1}>
          <Icon
            Icon={visibility === "player" ? EyeIcon : EyeClosedIcon}
            color="fg.muted"
            size="sm"
          />
          <Link onClick={onClick}>{name}</Link>
        </HStack>
      : <Span py={1}>{name}</Span>}

      <HStack>
        {onToggleFront && (
          <IconButton
            Icon={RefreshCwIcon}
            onClick={onToggleFront}
            size="2xs"
            variant="ghost"
          />
        )}
        <Checkbox
          onValueChange={onToggleSelection}
          size="sm"
          value={selected}
        />
      </HStack>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Resource Card Caption
//------------------------------------------------------------------------------

function ResourceCardCaption({ children }: { children: ReactNode }) {
  return (
    <HStack
      align="flex-start"
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
        <RichText key={i} text={paragraph} />
      ))}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Resource Card Info
//------------------------------------------------------------------------------

function ResourceCardInfo({
  children,
  columns = 1,
  ...rest
}: {
  children: ReactNode;
  columns?: number;
} & SimpleGridProps) {
  return (
    <SimpleGrid
      fontSize="xs"
      gapX={2}
      gapY={1}
      px={3}
      py={2}
      templateColumns={`repeat(${columns}, max-content 1fr)`}
      w="full"
      {...rest}
    >
      {children}
    </SimpleGrid>
  );
}

//------------------------------------------------------------------------------
// Resource Card Info
//------------------------------------------------------------------------------

function ResourceCardInfoCell({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <>
      <Span color="fg.muted">{label}</Span>
      <Box>{children}</Box>
    </>
  );
}
