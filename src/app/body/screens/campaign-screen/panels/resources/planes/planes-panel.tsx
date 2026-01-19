import {
  type DBPlane,
  type DBPlaneTranslation,
  dbPlaneSchema,
  dbPlaneTranslationSchema,
} from "~/models/resources/planes/db-plane";
import { type LocalizedPlane } from "~/models/resources/planes/localized-plane";
import { type Plane } from "~/models/resources/planes/plane";
import { planeStore } from "~/models/resources/planes/plane-store";
import { report } from "~/utils/error";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { PlaneCard } from "./plane-card";
import PlaneEditor from "./plane-editor";
import planeEditorForm, {
  type PlaneEditorFormFields,
} from "./plane-editor-form";
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
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(data: Partial<PlaneEditorFormFields>):
  | {
      resource: Partial<DBPlane>;
      translation: Partial<DBPlaneTranslation>;
    }
  | string {
  const maybePlane = {
    alignments: data.alignments,
    category: data.category,
    visibility: data.visibility,
  };

  const maybeTranslation = {
    name: data.name,
    page: data.page || null,
  };

  const plane = dbPlaneSchema.partial().safeParse(maybePlane);
  if (!plane.success) return report(plane.error, "form.error.invalid");

  const translation = dbPlaneTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { resource: plane.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// Planes Panel
//------------------------------------------------------------------------------

const PlanesPanel = createResourcesPanel(planeStore, {
  album: { AlbumCard: PlaneCard },
  filters: { Filters: PlanesFilters },
  form: {
    Editor: PlaneEditor,
    form: planeEditorForm,
    parseFormData,
  },
  table: { columns },
});

export default PlanesPanel;
