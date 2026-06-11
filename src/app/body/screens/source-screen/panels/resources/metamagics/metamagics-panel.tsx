import { type LocalizedMetamagic } from "~/models/resources/metamagics/localized-metamagic";
import { type Metamagic } from "~/models/resources/metamagics/metamagic";
import {
  metamagicForm,
  metamagicFormDataToDB,
} from "~/models/resources/metamagics/metamagic-form";
import { metamagicStore } from "~/models/resources/metamagics/metamagic-store";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { MetamagicCard } from "./metamagic-card";
import { createMetamagicEditor } from "./metamagic-editor";
import MetamagicsFilters from "./metamagics-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Metamagic, LocalizedMetamagic>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "sorcery_points",
    label: { en: "Sorcery Points", it: "Punti Stregoneria" },
    w: "8em",
  },
  {
    key: "prerequisite",
    label: { en: "Prerequisite", it: "Prerequisito" },
  },
] as const;

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
      parseFormData: metamagicFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default MetamagicsPanel;
