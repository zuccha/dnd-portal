import { SimpleGrid } from "@chakra-ui/react";
import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type ManeuverDetailResource = ReturnType<typeof maneuverStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Maneuver Detail
//------------------------------------------------------------------------------

export default function ManeuverDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: ManeuverDetailResource;
}) {
  const maneuver = resource;

  return (
    <ResourceDetail actions={actions} resource={maneuver}>
      {maneuver?.prerequisite.value && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={maneuver.prerequisite.label}>
            {maneuver.prerequisite.value}
          </ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
