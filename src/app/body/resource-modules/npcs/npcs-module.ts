import type { LocalizedNpc } from "~/models/resources/npcs/localized-npc";
import type { Npc } from "~/models/resources/npcs/npc";
import { npcForm, npcFormDataToResource } from "~/models/resources/npcs/npc-form";
import { npcStore } from "~/models/resources/npcs/npc-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import NpcDetail from "./detail/npc-detail";
import { createNpcEditor } from "./npc-editor";
import { NpcCard } from "./panel/npc-card";
import NpcsFilters from "./panel/npcs-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Npc, LocalizedNpc>([
  { key: "species", label: { en: "Species", it: "Specie" } },
  { key: "creature", label: { en: "Creature", it: "Creatura" } },
  { key: "date_of_birth", label: { en: "Birth", it: "Nascita" } },
  { key: "date_of_death", label: { en: "Death", it: "Morte" } },
]);

//------------------------------------------------------------------------------
// NPCs Module
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  npcStore,
  { initialPaletteName: "moss", path: Route.ResourcesWorldNpcs },
  {
    album: { AlbumCard: NpcCard },
    detail: { Detail: NpcDetail },
    filters: { Filters: NpcsFilters },
    form: {
      Editor: createNpcEditor(npcForm),
      form: npcForm,
      parseFormData: npcFormDataToResource,
    },
    table: { columns },
  },
);
