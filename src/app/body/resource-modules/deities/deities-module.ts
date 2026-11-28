import type { Deity } from "~/models/resources/deities/deity";
import { deityForm, deityFormDataToResource } from "~/models/resources/deities/deity-form";
import { deityStore } from "~/models/resources/deities/deity-store";
import type { LocalizedDeity } from "~/models/resources/deities/localized-deity";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import { createDeityEditor } from "./deity-editor";
import DeityDetail from "./detail/deity-detail";
import DeitiesFilters from "./panel/deities-filters";
import { DeityCard } from "./panel/deity-card";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Deity, LocalizedDeity>([
  { key: "alignment", label: { en: "Alignment", it: "Allineamento" } },
  { key: "domain", label: { en: "Domain", it: "Dominio" } },
]);

//------------------------------------------------------------------------------
// Deities Module
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  deityStore,
  { initialPaletteName: "moss", path: Route.ResourcesWorldDeities },
  {
    album: { AlbumCard: DeityCard },
    detail: { Detail: DeityDetail },
    filters: { Filters: DeitiesFilters },
    form: {
      Editor: createDeityEditor(deityForm),
      form: deityForm,
      parseFormData: deityFormDataToResource,
    },
    table: { columns },
  },
);
