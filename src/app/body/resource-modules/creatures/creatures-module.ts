import { type Creature } from "~/models/resources/creatures/creature";
import {
  creatureForm,
  creatureFormDataToResource,
} from "~/models/resources/creatures/creature-form";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { type LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import { createCreatureEditor } from "./creature-editor";
import CreatureDetail from "./detail/creature-detail";
import { CreatureCard } from "./panel/creature-card";
import CreaturesFilters from "./panel/creatures-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Creature, LocalizedCreature>([
  {
    key: "type",
    label: { en: "Type", it: "Tipo" },
  },
  {
    key: "sizes",
    label: { en: "Sizes", it: "Taglie" },
  },
  {
    key: "alignment",
    label: { en: "Alignment", it: "Allineamento" },
  },
  {
    key: "cr",
    label: { en: "CR", it: "GS" },
    textAlign: "right",
    w: "1%",
  },
  {
    key: "hp",
    label: { en: "HP", it: "PF" },
    textAlign: "right",
    w: "1%",
  },
  {
    key: "ac",
    label: { en: "AC", it: "CA" },
    textAlign: "right",
    w: "1%",
  },
]);

//------------------------------------------------------------------------------
// Creatures Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  creatureStore,
  {
    initialPaletteName: "copper",
    initialView: "cards",
    path: Route.ResourcesBestiaryMonsters,
  },
  {
    album: { AlbumCard: CreatureCard },
    Detail: CreatureDetail,
    filters: { Filters: CreaturesFilters },
    form: {
      Editor: createCreatureEditor(creatureForm),
      form: creatureForm,
      parseFormData: creatureFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);
