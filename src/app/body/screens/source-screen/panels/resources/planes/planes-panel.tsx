import { type LocalizedPlane } from "~/models/resources/planes/localized-plane";
import { type Plane } from "~/models/resources/planes/plane";
import { planeForm, planeFormDataToResource } from "~/models/resources/planes/plane-form";
import { planeStore } from "~/models/resources/planes/plane-store";
import { createResourcesPanel } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import { PlaneCard } from "./plane-card";
import { createPlaneEditor } from "./plane-editor";
import PlanesFilters from "./planes-filters";

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

const PlanesPanel = createResourcesPanel(
  planeStore,
  { initialPaletteName: "moss" },
  {
    album: { AlbumCard: PlaneCard },
    filters: { Filters: PlanesFilters },
    form: {
      Editor: createPlaneEditor(planeForm),
      form: planeForm,
      parseFormData: planeFormDataToResource,
    },
    table: { columns },
  },
);

export default PlanesPanel;
