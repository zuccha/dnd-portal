import { type Feat } from "~/models/resources/feats/feat";
import {
  featForm,
  featFormDataToResource,
} from "~/models/resources/feats/feat-form";
import { featStore } from "~/models/resources/feats/feat-store";
import { type LocalizedFeat } from "~/models/resources/feats/localized-feat";
import { createResourcesPanel } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import { FeatCard } from "./feat-card";
import { createFeatEditor } from "./feat-editor";
import FeatsFilters from "./feats-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Feat, LocalizedFeat>([
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
]);

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
      parseFormData: featFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default FeatsPanel;
