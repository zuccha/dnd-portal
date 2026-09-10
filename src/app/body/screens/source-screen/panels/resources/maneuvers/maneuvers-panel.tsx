import { type LocalizedManeuver } from "~/models/resources/maneuvers/localized-maneuver";
import { type Maneuver } from "~/models/resources/maneuvers/maneuver";
import {
  maneuverForm,
  maneuverFormDataToResource,
} from "~/models/resources/maneuvers/maneuver-form";
import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import { createResourcesPanel } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import { ManeuverCard } from "./maneuver-card";
import { createManeuverEditor } from "./maneuver-editor";
import ManeuversFilters from "./maneuvers-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Maneuver, LocalizedManeuver>([
  {
    key: "prerequisite",
    label: { en: "Prerequisite", it: "Prerequisito" },
  },
]);

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
      parseFormData: maneuverFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default ManeuversPanel;
