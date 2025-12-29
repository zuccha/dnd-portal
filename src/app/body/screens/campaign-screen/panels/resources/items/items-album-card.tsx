import { HStack, Span, type StackProps, VStack } from "@chakra-ui/react";
import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import AlbumCard from "~/ui/album-card";

//------------------------------------------------------------------------------
// Items Album Card Page 0
//------------------------------------------------------------------------------

export type ItemsAlbumCardPage0Props = StackProps & {
  localizedResource: LocalizedItem;
};

export function ItemsAlbumCardPage0({
  localizedResource,
  ...rest
}: ItemsAlbumCardPage0Props) {
  const { cost, magic_type, notes, weight } = localizedResource;
  return (
    <VStack {...rest}>
      <AlbumCard.Caption>
        <VStack gap={0} w="full">
          <HStack justify="space-between" w="full">
            <Span>{magic_type}</Span>
            <Span>{cost}</Span>
          </HStack>
          <HStack justify="space-between" w="full">
            <Span></Span>
            <Span>{weight}</Span>
          </HStack>
        </VStack>
      </AlbumCard.Caption>

      <AlbumCard.Description description={notes} />
    </VStack>
  );
}
