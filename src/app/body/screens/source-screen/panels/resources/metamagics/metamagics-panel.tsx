import { type LocalizedMetamagic } from "~/models/resources/metamagics/localized-metamagic";
import { type Metamagic } from "~/models/resources/metamagics/metamagic";
import {
  metamagicForm,
  metamagicFormDataToResource,
} from "~/models/resources/metamagics/metamagic-form";
import { metamagicStore } from "~/models/resources/metamagics/metamagic-store";
import { createResourcesPanel } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import { MetamagicCard } from "./metamagic-card";
import { createMetamagicEditor } from "./metamagic-editor";
import MetamagicsFilters from "./metamagics-filters";

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

const MetamagicsPanel = createResourcesPanel(
  metamagicStore,
  { initialPaletteName: "azure" },
  {
    album: { AlbumCard: MetamagicCard },
    filters: { Filters: MetamagicsFilters },
    form: {
      Editor: createMetamagicEditor(metamagicForm),
      form: metamagicForm,
      parseFormData: metamagicFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default MetamagicsPanel;
