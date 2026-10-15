import { SimpleGrid } from "@chakra-ui/react";
import { vehicleStore } from "~/models/resources/vehicles/vehicle-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type VehicleDetailResource = ReturnType<typeof vehicleStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Vehicle Detail
//------------------------------------------------------------------------------

export default function VehicleDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: VehicleDetailResource;
}) {
  const vehicle = resource;

  return (
    <ResourceDetail actions={actions} resource={vehicle}>
      {vehicle && (
        <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={vehicle.armorClass.label}>
            {vehicle.armorClass.value}
          </ResourceDetailField>
          <ResourceDetailField label={vehicle.hitPoints.label}>
            {vehicle.hitPoints.value}
          </ResourceDetailField>
          <ResourceDetailField label={vehicle.damageThreshold.label}>
            {vehicle.damageThreshold.value}
          </ResourceDetailField>
          <ResourceDetailField label={vehicle.crew.label}>{vehicle.crew.value}</ResourceDetailField>
          <ResourceDetailField label={vehicle.passengers.label}>
            {vehicle.passengers.value}
          </ResourceDetailField>
          <ResourceDetailField label={vehicle.cargo.label}>
            {vehicle.cargo.value}
          </ResourceDetailField>
          <ResourceDetailField label={vehicle.speed.label}>
            {vehicle.speed.value}
          </ResourceDetailField>
          <ResourceDetailField label={vehicle.cost.label}>{vehicle.cost.value}</ResourceDetailField>
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
