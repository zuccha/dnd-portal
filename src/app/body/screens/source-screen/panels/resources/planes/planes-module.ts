import { type LocalizedPlane } from "~/models/resources/planes/localized-plane";
import { type Plane } from "~/models/resources/planes/plane";
import { planeForm, planeFormDataToResource } from "~/models/resources/planes/plane-form";
import { planeStore } from "~/models/resources/planes/plane-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import PlaneDetail from "./detail/plane-detail";
import { PlaneCard } from "./panel/plane-card";
import PlanesFilters from "./panel/planes-filters";
import { createPlaneEditor } from "./plane-editor";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Plane, LocalizedPlane>([
  {
    key: "category",
    label: { en: "Category", it: "Categoria" },
  },
  {
    key: "alignments",
    label: { en: "Alignment", it: "Allineamento" },
  },
]);

//------------------------------------------------------------------------------
// Planes Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  planeStore,
  { initialPaletteName: "moss", path: Route.ResourcesWorldPlanes },
  {
    album: { AlbumCard: PlaneCard },
    Detail: PlaneDetail,
    filters: { Filters: PlanesFilters },
    form: {
      Editor: createPlaneEditor(planeForm),
      form: planeForm,
      parseFormData: planeFormDataToResource,
    },
    table: { columns },
  },
);
