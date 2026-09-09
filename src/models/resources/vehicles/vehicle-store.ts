import { createResourceStore } from "../resource-store";
import { useLocalizeVehicle } from "./localized-vehicle";
import { defaultVehicle } from "./vehicle";
import {
  defaultVehicleFilters,
  vehicleFiltersSchema,
  vehicleOrderOptions,
} from "./vehicle-filters";

//------------------------------------------------------------------------------
// Vehicle Store
//------------------------------------------------------------------------------

export const vehicleStore = createResourceStore("vehicle", {
  defaultFilters: defaultVehicleFilters,
  defaultResource: defaultVehicle,
  displayName: { en: "Vehicles", it: "Veicoli" },
  filtersSchema: vehicleFiltersSchema,
  orderOptions: vehicleOrderOptions,
  useLocalizeResource: useLocalizeVehicle,
});
