import { type Feat } from "~/models/resources/feats/feat";
import { featForm, featFormDataToDB } from "~/models/resources/feats/feat-form";
import { featStore } from "~/models/resources/feats/feat-store";
import { type LocalizedFeat } from "~/models/resources/feats/localized-feat";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { FeatCard } from "./feat-card";
import { createFeatEditor } from "./feat-editor";
import FeatsFilters from "./feats-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Feat, LocalizedFeat>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "category",
    label: { en: "Category", it: "Categoria" },
  },
  {
    key: "min_level",
    label: { en: "Min. Level", it: "Livello Min." },
    textAlign: "right",
    w: "1%",
  },
  {
    key: "prerequisite",
    label: { en: "Other Prerequisite", it: "Altro Prerequisito" },
  },
] as const;

//------------------------------------------------------------------------------
// Feats Panel
//------------------------------------------------------------------------------

const FeatsPanel = createResourcesPanel(
  featStore,
  { initialPaletteName: "chocolate" },
  {
    album: { AlbumCard: FeatCard },
    filters: { Filters: FeatsFilters },
    form: {
      Editor: createFeatEditor(featForm),
      form: featForm,
      parseFormData: featFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default FeatsPanel;
