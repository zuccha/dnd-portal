import type { ChronicleEntry } from "~/models/resources/chronicle-entries/chronicle-entry";
import {
  chronicleEntryForm,
  chronicleEntryFormDataToResource,
} from "~/models/resources/chronicle-entries/chronicle-entry-form";
import { chronicleEntryStore } from "~/models/resources/chronicle-entries/chronicle-entry-store";
import type { LocalizedChronicleEntry } from "~/models/resources/chronicle-entries/localized-chronicle-entry";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import { createChronicleEntryEditor } from "./chronicle-entry-editor";
import ChronicleEntryDetail from "./detail/chronicle-entry-detail";
import ChronicleEntriesFilters from "./panel/chronicle-entries-filters";
import { ChronicleEntryCard } from "./panel/chronicle-entry-card";

//------------------------------------------------------------------------------
// Chronicle Entry Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<ChronicleEntry, LocalizedChronicleEntry>([
  { key: "date", label: { en: "Date", it: "Data" } },
]);

//------------------------------------------------------------------------------
// Chronicle Entries Module
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  chronicleEntryStore,
  { initialPaletteName: "moss", path: Route.ResourcesWorldChronicleEntries },
  {
    album: { AlbumCard: ChronicleEntryCard },
    detail: { Detail: ChronicleEntryDetail },
    filters: { Filters: ChronicleEntriesFilters },
    form: {
      Editor: createChronicleEntryEditor(chronicleEntryForm),
      form: chronicleEntryForm,
      parseFormData: chronicleEntryFormDataToResource,
    },
    table: { columns },
  },
);
