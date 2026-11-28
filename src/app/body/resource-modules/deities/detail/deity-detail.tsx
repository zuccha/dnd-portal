import { SimpleGrid } from "@chakra-ui/react";
import { deityStore } from "~/models/resources/deities/deity-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

//------------------------------------------------------------------------------
// Deity Detail Resource
//------------------------------------------------------------------------------

type DeityDetailResource = ReturnType<typeof deityStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Deity Detail
//------------------------------------------------------------------------------

export default function DeityDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: DeityDetailResource;
}) {
  return (
    <ResourceDetail actions={actions} resource={resource}>
      {resource && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={resource.alignment.label}>
            {resource.alignment.value}
          </ResourceDetailField>
          <ResourceDetailField label={resource.domain.label}>
            {resource.domain.value}
          </ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
