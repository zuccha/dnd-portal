import { type LocalizedManeuver } from "~/models/resources/maneuvers/localized-maneuver";
import { type Maneuver } from "~/models/resources/maneuvers/maneuver";
import {
  maneuverForm,
  maneuverFormDataToResource,
} from "~/models/resources/maneuvers/maneuver-form";
import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import ManeuverDetail from "./detail/maneuver-detail";
import { createManeuverEditor } from "./maneuver-editor";
import { ManeuverCard } from "./panel/maneuver-card";
import ManeuversFilters from "./panel/maneuvers-filters";

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
