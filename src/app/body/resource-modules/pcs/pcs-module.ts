import type { LocalizedPc } from "~/models/resources/pcs/localized-pc";
import type { Pc } from "~/models/resources/pcs/pc";
import { pcForm, pcFormDataToResource } from "~/models/resources/pcs/pc-form";
import { pcStore } from "~/models/resources/pcs/pc-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import PcDetail from "./detail/pc-detail";
import { PcCard } from "./panel/pc-card";
import PcsFilters from "./panel/pcs-filters";
import { createPcEditor } from "./pc-editor";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Pc, LocalizedPc>([
  { key: "species", label: { en: "Species", it: "Specie" } },
  { key: "classes", label: { en: "Classes", it: "Classi" } },
  { key: "level", label: { en: "Level", it: "Livello" } },
  { key: "status", label: { en: "Status", it: "Stato" } },
]);

//------------------------------------------------------------------------------
// PC Module
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  pcStore,
  { initialPaletteName: "moss", path: Route.ResourcesCampaignPcs },
  {
    album: { AlbumCard: PcCard },
    detail: { Detail: PcDetail },
    filters: { Filters: PcsFilters },
    form: {
      Editor: createPcEditor(pcForm),
      form: pcForm,
      parseFormData: pcFormDataToResource,
    },
    table: { columns },
  },
);
