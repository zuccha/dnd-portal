import { type LocalizedManeuver } from "~/models/resources/maneuvers/localized-maneuver";
import { type Maneuver } from "~/models/resources/maneuvers/maneuver";
import {
  maneuverForm,
  maneuverFormDataToDB,
} from "~/models/resources/maneuvers/maneuver-form";
import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { ManeuverCard } from "./maneuver-card";
import { createManeuverEditor } from "./maneuver-editor";
import ManeuversFilters from "./maneuvers-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Maneuver, LocalizedManeuver>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "prerequisite",
    label: { en: "Prerequisite", it: "Prerequisito" },
  },
] as const;

//------------------------------------------------------------------------------
// Maneuvers Panel
//------------------------------------------------------------------------------

const ManeuversPanel = createResourcesPanel(
  maneuverStore,
  { initialPaletteName: "brick" },
  {
    album: { AlbumCard: ManeuverCard },
    filters: { Filters: ManeuversFilters },
    form: {
      Editor: createManeuverEditor(maneuverForm),
      form: maneuverForm,
      parseFormData: maneuverFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default ManeuversPanel;
