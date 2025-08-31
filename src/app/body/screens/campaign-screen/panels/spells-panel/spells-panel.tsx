import {
  type Spell,
  type SpellFilters,
  spellsStore,
} from "../../../../../../resources/spell";
import {
  type SpellTranslation,
  useTranslateSpell,
} from "../../../../../../resources/spell-translation";
import { createResourcesPanel } from "../resources/resources-panel";
import type { ResourcesTableColumn } from "../resources/resources-table";
import SpellCard from "./spell-card";
import SpellsFilters from "./spells-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: Omit<ResourcesTableColumn<SpellTranslation>, "label">[] = [
  { key: "name" },
  { key: "level", maxW: "5em", textAlign: "center" },
  { key: "character_classes", maxW: "8em" },
  { key: "school", maxW: "8em" },
  { key: "casting_time", maxW: "9em" },
  { key: "ritual", textAlign: "center", w: "4em" },
  { key: "range", maxW: "8em" },
  { key: "duration", maxW: "9em" },
  { key: "concentration", textAlign: "center", w: "4em" },
  { key: "components" },
] as const;

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  name: {
    en: "Name",
    it: "Nome",
  },

  level: {
    en: "Lvl",
    it: "Lvl",
  },

  character_classes: {
    en: "Classes",
    it: "Classi",
  },

  school: {
    en: "School",
    it: "Scuola",
  },

  casting_time: {
    en: "Cast",
    it: "Lancio",
  },

  range: {
    en: "Range",
    it: "Gittata",
  },

  duration: {
    en: "Duration",
    it: "Durata",
  },

  ritual: {
    en: "R",
    it: "R",
  },

  concentration: {
    en: "C",
    it: "C",
  },

  components: {
    en: "V, S, M",
    it: "V, S, M",
  },
};

//------------------------------------------------------------------------------
// Spells Panel
//------------------------------------------------------------------------------

const SpellsPanel = createResourcesPanel<Spell, SpellTranslation, SpellFilters>(
  {
    Filters: SpellsFilters,
    ResourceCard: SpellCard,
    listTableColumns: columns,
    listTableColumnsI18nContext: i18nContext,
    listTableDescriptionKey: "description",
    store: spellsStore,
    useTranslateResource: useTranslateSpell,
  }
);

export default SpellsPanel;
