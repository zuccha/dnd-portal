import { type LocalizedVehicle } from "~/models/resources/vehicles/localized-vehicle";
import { type Vehicle } from "~/models/resources/vehicles/vehicle";
import {
  vehicleForm,
  vehicleFormDataToDB,
} from "~/models/resources/vehicles/vehicle-form";
import { vehicleStore } from "~/models/resources/vehicles/vehicle-store";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
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
    key: "ac",
    label: { en: "AC", it: "CA" },
    textAlign: "right",
    w: "1%",
  },
  {
    key: "hp",
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
