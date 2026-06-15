import { createResourceStore } from "../resource-store";
import { useLocalizeVehicle } from "./localized-vehicle";
import {
  defaultVehicle,
  vehicleSchema,
  vehicleTranslationFields,
} from "./vehicle";
import {
  defaultVehicleFilters,
  vehicleFiltersSchema,
  vehicleOrderOptions,
} from "./vehicle-filters";

//------------------------------------------------------------------------------
// Vehicle Store
//------------------------------------------------------------------------------

export const vehicleStore = createResourceStore(
  { p: "vehicles", s: "vehicle" },
  {
    defaultFilters: defaultVehicleFilters,
    defaultResource: defaultVehicle,
    filtersSchema: vehicleFiltersSchema,
    kinds: ["vehicle"],
    orderOptions: vehicleOrderOptions,
    resourceSchema: vehicleSchema,
    translationFields: vehicleTranslationFields,
    useLocalizeResource: useLocalizeVehicle,
  },
);
