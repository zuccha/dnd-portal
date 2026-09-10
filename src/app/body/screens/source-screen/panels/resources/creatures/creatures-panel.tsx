import { type Creature } from "~/models/resources/creatures/creature";
import {
  creatureForm,
  creatureFormDataToResource,
} from "~/models/resources/creatures/creature-form";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { type LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import { createResourcesPanel } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import { CreatureCard } from "./creature-card";
import { createCreatureEditor } from "./creature-editor";
import CreaturesFilters from "./creatures-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Creature, LocalizedCreature>([
  {
    key: "type",
    label: { en: "Type", it: "Tipo" },
  },
  {
    key: "size",
    label: { en: "Size", it: "Taglia" },
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
  {
    key: "habitats",
    label: { en: "Habitat", it: "Habitat" },
  },
]);

//------------------------------------------------------------------------------
// Creatures Panel
//------------------------------------------------------------------------------

const CreaturesPanel = createResourcesPanel(
  creatureStore,
  { initialPaletteName: "copper" },
  {
    album: { AlbumCard: CreatureCard },
    filters: { Filters: CreaturesFilters },
    form: {
      Editor: createCreatureEditor(creatureForm),
      form: creatureForm,
      parseFormData: creatureFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default CreaturesPanel;
