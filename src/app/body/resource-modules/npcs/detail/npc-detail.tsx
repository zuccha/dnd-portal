import { SimpleGrid } from "@chakra-ui/react";
import { npcStore } from "~/models/resources/npcs/npc-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

//------------------------------------------------------------------------------
// NPC Detail Resource
//------------------------------------------------------------------------------

type NpcDetailResource = ReturnType<typeof npcStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// NPC Detail
//------------------------------------------------------------------------------

export default function NpcDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: NpcDetailResource;
}) {
  return (
    <ResourceDetail actions={actions} resource={resource}>
      {resource && (
        <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={resource.creature.label}>
            {resource.creature.resource ? (
              <RouterLink
                to={resourceDetailRoute(
                  resource.creature.resource.kind,
                  resource.creature.resource.id,
                )}
              >
                {resource.creature.resource.name}
              </RouterLink>
            ) : (
              "-"
            )}
          </ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
