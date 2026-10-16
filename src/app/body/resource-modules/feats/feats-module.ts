import { type Feat } from "~/models/resources/feats/feat";
import { featForm, featFormDataToResource } from "~/models/resources/feats/feat-form";
import { featStore } from "~/models/resources/feats/feat-store";
import { type LocalizedFeat } from "~/models/resources/feats/localized-feat";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import FeatDetail from "./detail/feat-detail";
import { createFeatEditor } from "./feat-editor";
import { FeatCard } from "./panel/feat-card";
import FeatsFilters from "./panel/feats-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Feat, LocalizedFeat>([
  {
    key: "category",
    label: { en: "Category", it: "Categoria" },
  },
  {
    key: "minimum_level",
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

export const resourceModule = createResourceModule(
  featStore,
  { initialPaletteName: "chocolate", path: Route.ResourcesCharacterFeats },
  {
    album: { AlbumCard: FeatCard },
    detail: { Detail: FeatDetail },
    filters: { Filters: FeatsFilters },
    form: {
      Editor: createFeatEditor(featForm),
      form: featForm,
      parseFormData: featFormDataToResource,
    },
    table: { columns, hasDescription: true },
  },
);
