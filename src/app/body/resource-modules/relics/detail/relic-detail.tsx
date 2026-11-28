import { SimpleGrid } from "@chakra-ui/react";
import { relicStore } from "~/models/resources/relics/relic-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

//------------------------------------------------------------------------------
// Relic Detail Resource
//------------------------------------------------------------------------------

type RelicDetailResource = ReturnType<typeof relicStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Relic Detail
//------------------------------------------------------------------------------

export default function RelicDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: RelicDetailResource;
}) {
  return (
    <ResourceDetail actions={actions} resource={resource}>
      {resource && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={resource.type.label}>
            {resource.type.value}
          </ResourceDetailField>
          <ResourceDetailField label={resource.equipment.label}>
            {resource.equipment.resource ? (
              <RouterLink
                to={resourceDetailRoute(
                  resource.equipment.resource.kind,
                  resource.equipment.resource.id,
                )}
              >
                {resource.equipment.resource.name}
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
