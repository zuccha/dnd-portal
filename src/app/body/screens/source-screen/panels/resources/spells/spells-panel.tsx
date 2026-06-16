import ConcentrationIcon from "~/icons/concentration-icon";
import RitualIcon from "~/icons/ritual-icon";
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
    textAlign: "center",
    w: "1%",
  },
  {
    key: "school",
    label: { en: "School", it: "Scuola" },
  },
  {
    key: "casting_time",
    label: { en: "Cast", it: "Lancio" },
  },
  {
    icon: RitualIcon,
    key: "ritual",
    label: { en: "R", it: "R" },
    textAlign: "center",
    w: "1%",
  },
  {
    key: "range",
    label: { en: "Range", it: "Gittata" },
  },
  {
    key: "duration",
    label: { en: "Duration", it: "Durata" },
  },
  {
    icon: ConcentrationIcon,
    key: "concentration",
    label: { en: "C", it: "C" },
    textAlign: "center",
    w: "1%",
  },
  {
    key: "components",
    label: { en: "V, S, M", it: "V, S, M" },
    w: "1%",
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
