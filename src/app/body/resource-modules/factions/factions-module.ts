import type { Faction } from "~/models/resources/factions/faction";
import { factionForm, factionFormDataToResource } from "~/models/resources/factions/faction-form";
import { factionStore } from "~/models/resources/factions/faction-store";
import type { LocalizedFaction } from "~/models/resources/factions/localized-faction";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import FactionDetail from "./detail/faction-detail";
import { createFactionEditor } from "./faction-editor";
import { FactionCard } from "./panel/faction-card";
import FactionsFilters from "./panel/factions-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Faction, LocalizedFaction>([
  { key: "type", label: { en: "Type", it: "Tipo" } },
]);

//------------------------------------------------------------------------------
// Factions Module
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  factionStore,
  { initialPaletteName: "moss", path: Route.ResourcesWorldFactions },
  {
    album: { AlbumCard: FactionCard },
    detail: { Detail: FactionDetail },
    filters: { Filters: FactionsFilters },
    form: {
      Editor: createFactionEditor(factionForm),
      form: factionForm,
      parseFormData: factionFormDataToResource,
    },
    table: { columns },
  },
);
