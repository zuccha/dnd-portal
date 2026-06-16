import { type Creature } from "~/models/resources/creatures/creature";
import {
  creatureForm,
  creatureFormDataToDB,
} from "~/models/resources/creatures/creature-form";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import { type LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { CreatureCard } from "./creature-card";
import { createCreatureEditor } from "./creature-editor";
import CreaturesFilters from "./creatures-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Creature, LocalizedCreature>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
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
] as const;

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
      parseFormData: creatureFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default CreaturesPanel;
