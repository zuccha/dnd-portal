import type { LocalizedRelic } from "~/models/resources/relics/localized-relic";
import type { Relic } from "~/models/resources/relics/relic";
import { relicForm, relicFormDataToResource } from "~/models/resources/relics/relic-form";
import { relicStore } from "~/models/resources/relics/relic-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import RelicDetail from "./detail/relic-detail";
import { RelicCard } from "./panel/relic-card";
import RelicsFilters from "./panel/relics-filters";
import { createRelicEditor } from "./relic-editor";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Relic, LocalizedRelic>([
  { key: "type", label: { en: "Type", it: "Tipo" } },
  { key: "equipment", label: { en: "Equipment", it: "Equipaggiamento" } },
]);

//------------------------------------------------------------------------------
// Relics Module
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  relicStore,
  { initialPaletteName: "moss", path: Route.ResourcesWorldRelics },
  {
    album: { AlbumCard: RelicCard },
    detail: { Detail: RelicDetail },
    filters: { Filters: RelicsFilters },
    form: {
      Editor: createRelicEditor(relicForm),
      form: relicForm,
      parseFormData: relicFormDataToResource,
    },
    table: { columns },
  },
);
