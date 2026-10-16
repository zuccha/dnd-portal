import { type LocalizedMetamagic } from "~/models/resources/metamagics/localized-metamagic";
import { type Metamagic } from "~/models/resources/metamagics/metamagic";
import {
  metamagicForm,
  metamagicFormDataToResource,
} from "~/models/resources/metamagics/metamagic-form";
import { metamagicStore } from "~/models/resources/metamagics/metamagic-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import MetamagicDetail from "./detail/metamagic-detail";
import { createMetamagicEditor } from "./metamagic-editor";
import { MetamagicCard } from "./panel/metamagic-card";
import MetamagicsFilters from "./panel/metamagics-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Metamagic, LocalizedMetamagic>([
  {
    key: "sorcery_points",
    label: { en: "Sorcery Points", it: "Punti Stregoneria" },
    textAlign: "right",
    w: "1%",
  },
  {
    key: "prerequisite",
    label: { en: "Prerequisite", it: "Prerequisito" },
  },
]);

//------------------------------------------------------------------------------
// Metamagics Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  metamagicStore,
  { initialPaletteName: "azure", path: Route.ResourcesAbilitiesMetamagic },
  {
    album: { AlbumCard: MetamagicCard },
    detail: { Detail: MetamagicDetail },
    filters: { Filters: MetamagicsFilters },
    form: {
      Editor: createMetamagicEditor(metamagicForm),
      form: metamagicForm,
      parseFormData: metamagicFormDataToResource,
    },
    table: { columns, hasDescription: true },
  },
);
