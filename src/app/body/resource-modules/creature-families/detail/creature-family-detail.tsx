import { GridItem, SimpleGrid, VStack } from "@chakra-ui/react";
import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";
import ResourceDetailLinks from "../../resource-detail-links";

//------------------------------------------------------------------------------
// Creature Family Detail Resource
//------------------------------------------------------------------------------

type CreatureFamilyDetailResource = ReturnType<typeof creatureFamilyStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Creature Family Detail
//------------------------------------------------------------------------------

export default function CreatureFamilyDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: CreatureFamilyDetailResource;
}) {
  const family = resource;

  return (
    <ResourceDetail actions={actions} resource={family}>
      {family && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={3}>
          {family.habitats.resources.length > 0 && (
            <ResourceDetailField label={family.habitats.label}>
              <ResourceDetailLinks resources={family.habitats.resources} />
            </ResourceDetailField>
          )}
          {family.planes.resources.length > 0 && (
            <ResourceDetailField label={family.planes.label}>
              <ResourceDetailLinks resources={family.planes.resources} />
            </ResourceDetailField>
          )}
          {family.treasures.resources.length > 0 && (
            <ResourceDetailField label={family.treasures.label}>
              <ResourceDetailLinks resources={family.treasures.resources} />
            </ResourceDetailField>
          )}
          {family.creatures.resources.length > 0 && (
            <GridItem colSpan={{ base: 1, sm: 2 }}>
              <ResourceDetailField label={family.creatures.label}>
                <VStack align="flex-start" gap={1}>
                  {family.creatures.resources.map(({ id, name }) => (
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
