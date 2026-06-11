import { type Background } from "~/models/resources/backgrounds/background";
import {
  backgroundForm,
  backgroundFormDataToDB,
} from "~/models/resources/backgrounds/background-form";
import { backgroundStore } from "~/models/resources/backgrounds/background-store";
import { type LocalizedBackground } from "~/models/resources/backgrounds/localized-background";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { BackgroundCard } from "./background-card";
import { createBackgroundEditor } from "./background-editor";
import BackgroundsFilters from "./backgrounds-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Background, LocalizedBackground>["columns"] =
  [
    {
      key: "name",
      label: { en: "Name", it: "Nome" },
    },
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
  ] as const;

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
      parseFormData: backgroundFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default BackgroundsPanel;
