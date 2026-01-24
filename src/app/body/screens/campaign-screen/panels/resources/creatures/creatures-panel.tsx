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
    w: "10em",
  },
  {
    key: "size",
    label: { en: "Size", it: "Taglia" },
    w: "10em",
  },
  {
    key: "alignment",
    label: { en: "Alignment", it: "Allineamento" },
    w: "10em",
  },
  {
    key: "habitats",
    label: { en: "Habitat", it: "Habitat" },
    maxW: "10em",
    w: "10em",
  },
  {
    key: "cr",
    label: { en: "CR", it: "GS" },
    w: "4em",
  },
  {
    key: "hp",
    label: { en: "HP", it: "PF" },
    w: "4em",
  },
  {
    key: "ac",
    label: { en: "AC", it: "CA" },
    w: "4em",
  },
  {
    key: "ability_str",
    label: { en: "Str", it: "For" },
    w: "4em",
  },
  {
    key: "ability_dex",
    label: { en: "Dex", it: "Des" },
    w: "4em",
  },
  {
    key: "ability_con",
    label: { en: "Con", it: "Cos" },
    w: "4em",
  },
  {
    key: "ability_int",
    label: { en: "Int", it: "Int" },
    w: "4em",
  },
  {
    key: "ability_wis",
    label: { en: "Wis", it: "Sag" },
    w: "4em",
  },
  {
    key: "ability_cha",
    label: { en: "Cha", it: "Car" },
    w: "4em",
  },
] as const;

//------------------------------------------------------------------------------
// Creatures Panel
//------------------------------------------------------------------------------

const CreaturesPanel = createResourcesPanel(
  creatureStore,
  { initialPaletteName: "red" },
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
