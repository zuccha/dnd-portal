import { createResourceStore } from "../resource-store";
import { localizeVehicle, useVehicleLocalizationContext } from "./localized-vehicle";
import { defaultVehicle, vehicleTranslationFields } from "./vehicle";
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
  translationFields: vehicleTranslationFields,
  localizeResource: localizeVehicle,
  useLocalizationContext: useVehicleLocalizationContext,
});
