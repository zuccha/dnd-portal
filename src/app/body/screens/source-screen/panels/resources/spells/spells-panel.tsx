import { type LocalizedSpell } from "~/models/resources/spells/localized-spell";
import { type Spell } from "~/models/resources/spells/spell";
import {
  spellForm,
  spellFormDataToDB,
} from "~/models/resources/spells/spell-form";
import { spellStore } from "~/models/resources/spells/spell-store";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { SpellCard } from "./spell-card";
import { createSpellEditor } from "./spell-editor";
import SpellsFilters from "./spells-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Spell, LocalizedSpell>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "level",
    label: { en: "Lvl", it: "Lvl" },
    maxW: "5em",
    textAlign: "center",
  },
  {
    key: "school",
    label: { en: "School", it: "Scuola" },
    maxW: "8em",
  },
  {
    key: "casting_time",
    label: { en: "Cast", it: "Lancio" },
    maxW: "9em",
  },
  {
    key: "ritual",
    label: { en: "R", it: "R" },
    textAlign: "center",
    w: "4em",
  },
  {
    key: "range",
    label: { en: "Range", it: "Gittata" },
    maxW: "8em",
  },
  {
    key: "duration",
    label: { en: "Duration", it: "Durata" },
    maxW: "9em",
  },
  {
    key: "concentration",
    label: { en: "C", it: "C" },
    textAlign: "center",
    w: "4em",
  },
  {
    key: "components",
    label: { en: "V, S, M", it: "V, S, M" },
  },
] as const;

//------------------------------------------------------------------------------
// Spells Panel
//------------------------------------------------------------------------------

const SpellsPanel = createResourcesPanel(
  spellStore,
  { initialPaletteName: "rose" },
  {
    album: { AlbumCard: SpellCard },
    filters: { Filters: SpellsFilters },
    form: {
      Editor: createSpellEditor(spellForm),
      form: spellForm,
      parseFormData: spellFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default SpellsPanel;
