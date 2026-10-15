import { GridItem, SimpleGrid } from "@chakra-ui/react";
import { creatureTreasureStore } from "~/models/resources/creature-treasures/creature-treasure-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";
import ResourceDetailLinks from "../../resource-detail-links";

//------------------------------------------------------------------------------
// Creature Treasure Detail Resource
//------------------------------------------------------------------------------

type CreatureTreasureDetailResource = ReturnType<typeof creatureTreasureStore.useLocalizedResource>;

export default function CreatureTreasureDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: CreatureTreasureDetailResource;
}) {
  const treasure = resource;

  return (
    <ResourceDetail actions={actions} resource={treasure}>
      {treasure && treasure.families.resources.length > 0 && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={3}>
          <GridItem colSpan={{ base: 1, sm: 2 }}>
            <ResourceDetailField label={treasure.families.label}>
              <ResourceDetailLinks resources={treasure.families.resources} />
            </ResourceDetailField>
          </GridItem>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
