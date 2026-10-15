import { SimpleGrid } from "@chakra-ui/react";
import { planeStore } from "~/models/resources/planes/plane-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type PlaneDetailResource = ReturnType<typeof planeStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Plane Detail
//------------------------------------------------------------------------------

export default function PlaneDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: PlaneDetailResource;
}) {
  const plane = resource;

  return (
    <ResourceDetail actions={actions} resource={plane}>
      {plane && (
        <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
          {plane.alignments.value && (
            <ResourceDetailField label={plane.alignments.label}>
              {plane.alignments.value}
            </ResourceDetailField>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
