import { GridItem, SimpleGrid } from "@chakra-ui/react";
import { creatureHabitatStore } from "~/models/resources/creature-habitats/creature-habitat-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";
import ResourceDetailLinks from "../../resource-detail-links";

type CreatureHabitatDetailResource = ReturnType<typeof creatureHabitatStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Creature Habitat Detail
//------------------------------------------------------------------------------

export default function CreatureHabitatDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: CreatureHabitatDetailResource;
}) {
  const habitat = resource;

  return (
    <ResourceDetail actions={actions} resource={habitat}>
      {habitat && habitat.families.resources.length > 0 && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={3}>
          <GridItem colSpan={{ base: 1, sm: 2 }}>
            <ResourceDetailField label={habitat.families.label}>
              <ResourceDetailLinks resources={habitat.families.resources} />
            </ResourceDetailField>
          </GridItem>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
