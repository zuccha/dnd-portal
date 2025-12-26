import { HStack, Span, VStack } from "@chakra-ui/react";
import type { Item } from "~/models/resources/equipment/items/item";
import { useIsItemSelected } from "~/models/resources/equipment/items/items-store";
import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import ResourceCard from "../_base/resource-card";

//------------------------------------------------------------------------------
// Item Card
//------------------------------------------------------------------------------

export type ItemCardProps = {
  canEdit: boolean;
  localizedResource: LocalizedItem;
  onOpen: (resource: Item) => void;
};

export default function ItemCard({
  canEdit,
  localizedResource,
  onOpen,
}: ItemCardProps) {
  const { cost, id, magic_type, notes, weight } = localizedResource;

  const [selected, { toggle }] = useIsItemSelected(id);

  return (
    <ResourceCard
      canEdit={canEdit}
      localizedResource={localizedResource}
      onOpen={onOpen}
      onToggleSelected={toggle}
      selected={selected}
    >
      <ResourceCard.Caption>
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
      </ResourceCard.Caption>

      <ResourceCard.Description description={notes} />
    </ResourceCard>
  );
}
