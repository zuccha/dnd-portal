import { type Background } from "~/models/resources/backgrounds/background";
import {
  backgroundForm,
  backgroundFormDataToResource,
} from "~/models/resources/backgrounds/background-form";
import { backgroundStore } from "~/models/resources/backgrounds/background-store";
import { type LocalizedBackground } from "~/models/resources/backgrounds/localized-background";
import { createResourcesPanel } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import { BackgroundCard } from "./background-card";
import { createBackgroundEditor } from "./background-editor";
import BackgroundsFilters from "./backgrounds-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Background, LocalizedBackground>([
  {
    key: "ability_scores",
    label: { en: "Ability Scores", it: "Punteggi" },
  },
  {
    key: "feat",
    label: { en: "Feat", it: "Talento" },
  },
  {
    key: "skill_proficiencies",
    label: { en: "Skills", it: "Abilità" },
  },
  {
    key: "tool_proficiency",
    label: { en: "Tool", it: "Strumento" },
  },
]);

//------------------------------------------------------------------------------
// Backgrounds Panel
//------------------------------------------------------------------------------

const BackgroundsPanel = createResourcesPanel(
  backgroundStore,
  { initialPaletteName: "sage" },
  {
    album: { AlbumCard: BackgroundCard },
    filters: { Filters: BackgroundsFilters },
    form: {
      Editor: createBackgroundEditor(backgroundForm),
      form: backgroundForm,
      parseFormData: backgroundFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default BackgroundsPanel;
