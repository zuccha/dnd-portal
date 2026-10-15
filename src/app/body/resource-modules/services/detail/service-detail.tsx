import { SimpleGrid } from "@chakra-ui/react";
import { serviceStore } from "~/models/resources/services/service-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type ServiceDetailResource = ReturnType<typeof serviceStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Service Detail
//------------------------------------------------------------------------------

export default function ServiceDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: ServiceDetailResource;
}) {
  const service = resource;

  return (
    <ResourceDetail actions={actions} resource={service}>
      {service && (
        <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={service.price.label}>
            {service.price.value}
          </ResourceDetailField>
          {service.availability.value && (
            <ResourceDetailField label={service.availability.label}>
              {service.availability.value}
            </ResourceDetailField>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
