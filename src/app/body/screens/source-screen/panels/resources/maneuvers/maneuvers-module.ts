import { type LocalizedManeuver } from "~/models/resources/maneuvers/localized-maneuver";
import { type Maneuver } from "~/models/resources/maneuvers/maneuver";
import {
  maneuverForm,
  maneuverFormDataToResource,
} from "~/models/resources/maneuvers/maneuver-form";
import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import ManeuverDetail from "./detail/maneuver-detail";
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

export const resourceModule = createResourceModule(
  maneuverStore,
  { initialPaletteName: "brick", path: Route.ResourcesAbilitiesManeuvers },
  {
    album: { AlbumCard: ManeuverCard },
    Detail: ManeuverDetail,
    filters: { Filters: ManeuversFilters },
    form: {
      Editor: createManeuverEditor(maneuverForm),
      form: maneuverForm,
      parseFormData: maneuverFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);
