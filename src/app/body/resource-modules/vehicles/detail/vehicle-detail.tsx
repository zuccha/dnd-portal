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
          <ResourceDetailField label={vehicle.armor_class.label}>
            {vehicle.armor_class.value}
          </ResourceDetailField>
          <ResourceDetailField label={vehicle.hit_points.label}>
            {vehicle.hit_points.value}
          </ResourceDetailField>
          <ResourceDetailField label={vehicle.damage_threshold.label}>
            {vehicle.damage_threshold.value}
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
