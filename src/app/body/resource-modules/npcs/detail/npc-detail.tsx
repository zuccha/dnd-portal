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
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
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
          <ResourceDetailField label={resource.species.label}>
            {resource.species.resource ? (
              <RouterLink
                to={resourceDetailRoute(
                  resource.species.resource.kind,
                  resource.species.resource.id,
                )}
              >
                {resource.species.resource.name}
              </RouterLink>
            ) : (
              "-"
            )}
          </ResourceDetailField>
          <ResourceDetailField label={resource.date_of_birth.label}>
            {resource.date_of_birth.value || "-"}
          </ResourceDetailField>
          <ResourceDetailField label={resource.date_of_death.label}>
            {resource.date_of_death.value || "-"}
          </ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
