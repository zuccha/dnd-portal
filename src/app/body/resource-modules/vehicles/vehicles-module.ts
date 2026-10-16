import { type LocalizedVehicle } from "~/models/resources/vehicles/localized-vehicle";
import { type Vehicle } from "~/models/resources/vehicles/vehicle";
import { vehicleForm, vehicleFormDataToResource } from "~/models/resources/vehicles/vehicle-form";
import { vehicleStore } from "~/models/resources/vehicles/vehicle-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import VehicleDetail from "./detail/vehicle-detail";
import { VehicleCard } from "./panel/vehicle-card";
import VehiclesFilters from "./panel/vehicles-filters";
import { createVehicleEditor } from "./vehicle-editor";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Vehicle, LocalizedVehicle>([
  {
    key: "speed",
    label: { en: "Speed", it: "Velocità" },
    textAlign: "right",
  },
  {
    key: "crew",
    label: { en: "Crew", it: "Equipaggio" },
    textAlign: "right",
  },
  {
    key: "passengers",
    label: { en: "Passengers", it: "Passeggeri" },
    textAlign: "right",
  },
  {
    key: "cargo",
    label: { en: "Cargo", it: "Carico" },
    textAlign: "right",
  },
  {
    key: "armor_class",
    label: { en: "AC", it: "CA" },
    textAlign: "right",
    w: "1%",
  },
  {
    key: "hit_points",
    label: { en: "HP", it: "PF" },
    textAlign: "right",
    w: "1%",
  },
  {
    key: "damage_threshold",
    label: { en: "DT", it: "SD" },
    textAlign: "right",
    w: "1%",
  },
  {
    key: "cost",
    label: { en: "Cost", it: "Costo" },
    textAlign: "right",
    w: "1%",
  },
]);

//------------------------------------------------------------------------------
// Vehicles Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  vehicleStore,
  { initialPaletteName: "slate", path: Route.ResourcesMarketVehicles },
  {
    album: { AlbumCard: VehicleCard },
    detail: { Detail: VehicleDetail },
    filters: { Filters: VehiclesFilters },
    form: {
      Editor: createVehicleEditor(vehicleForm),
      form: vehicleForm,
      parseFormData: vehicleFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);
