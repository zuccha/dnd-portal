import { type LocalizedVehicle } from "~/models/resources/vehicles/localized-vehicle";
import { type Vehicle } from "~/models/resources/vehicles/vehicle";
import {
  vehicleForm,
  vehicleFormDataToDB,
} from "~/models/resources/vehicles/vehicle-form";
import { vehicleStore } from "~/models/resources/vehicles/vehicle-store";
import { createResourcesPanel } from "../../resources-panel";
import type { ResourcesTableExtra } from "../../resources-table";
import { VehicleCard } from "./vehicle-card";
import { createVehicleEditor } from "./vehicle-editor";
import VehiclesFilters from "./vehicles-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Vehicle, LocalizedVehicle>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "cost",
    label: { en: "Cost", it: "Costo" },
    w: "1%",
  },
  {
    key: "speed",
    label: { en: "Speed", it: "Velocità" },
    w: "1%",
  },
  {
    key: "crew",
    label: { en: "Crew", it: "Equipaggio" },
    w: "1%",
  },
  {
    key: "passengers",
    label: { en: "Passengers", it: "Passeggeri" },
    w: "1%",
  },
  {
    key: "cargo",
    label: { en: "Cargo", it: "Carico" },
    w: "1%",
  },
  {
    key: "hp",
    label: { en: "HP", it: "PF" },
    w: "1%",
  },
  {
    key: "ac",
    label: { en: "AC", it: "CA" },
    w: "1%",
  },
  {
    key: "damage_threshold",
    label: { en: "DT", it: "SD" },
    w: "1%",
  },
] as const;

//------------------------------------------------------------------------------
// Vehicles Panel
//------------------------------------------------------------------------------

const VehiclesPanel = createResourcesPanel(
  vehicleStore,
  { initialPaletteName: "slate" },
  {
    album: { AlbumCard: VehicleCard },
    filters: { Filters: VehiclesFilters },
    form: {
      Editor: createVehicleEditor(vehicleForm),
      form: vehicleForm,
      parseFormData: vehicleFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default VehiclesPanel;
