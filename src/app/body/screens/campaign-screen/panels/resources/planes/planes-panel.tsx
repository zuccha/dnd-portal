import { type LocalizedPlane } from "~/models/resources/planes/localized-plane";
import { type Plane } from "~/models/resources/planes/plane";
import {
  planeForm,
  planeFormDataToDB,
} from "~/models/resources/planes/plane-form";
import { planeStore } from "~/models/resources/planes/plane-store";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { PlaneCard } from "./plane-card";
import { createPlaneEditor } from "./plane-editor";
import PlanesFilters from "./planes-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Plane, LocalizedPlane>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "category",
    label: { en: "Category", it: "Categoria" },
  },
  {
    key: "alignments",
    label: { en: "Alignment", it: "Allineamento" },
  },
] as const;

//------------------------------------------------------------------------------
// Planes Panel
//------------------------------------------------------------------------------

const PlanesPanel = createResourcesPanel(planeStore, {
  album: { AlbumCard: PlaneCard },
  filters: { Filters: PlanesFilters },
  form: {
    Editor: createPlaneEditor(planeForm),
    form: planeForm,
    parseFormData: planeFormDataToDB,
  },
  table: { columns },
});

export default PlanesPanel;
