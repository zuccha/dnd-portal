import { vehicleStore } from "~/models/resources/vehicles/vehicle-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = vehicleStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Vehicle Detail Route
//------------------------------------------------------------------------------

export default function VehicleDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
