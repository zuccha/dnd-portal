import { GridItem, SimpleGrid, VStack } from "@chakra-ui/react";
import { creatureTagStore } from "~/models/resources/creature-tags/creature-tag-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type CreatureTagDetailResource = ReturnType<typeof creatureTagStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Creature Tag Detail
//------------------------------------------------------------------------------

export default function CreatureTagDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: CreatureTagDetailResource;
}) {
  const tag = resource;

  return (
    <ResourceDetail actions={actions} resource={tag}>
      {tag && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={3}>
          {tag.creatures.resources.length > 0 && (
            <GridItem colSpan={{ base: 1, sm: 2 }}>
              <ResourceDetailField label={tag.creatures.label}>
                <VStack align="flex-start" gap={1}>
                  {tag.creatures.resources.map(({ id, name }) => (
                    <RouterLink key={id} to={resourceDetailRoute("creature", id)}>
                      {name}
                    </RouterLink>
                  ))}
                </VStack>
              </ResourceDetailField>
            </GridItem>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
