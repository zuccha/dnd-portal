import { type Background } from "~/models/resources/backgrounds/background";
import {
  backgroundForm,
  backgroundFormDataToResource,
} from "~/models/resources/backgrounds/background-form";
import { backgroundStore } from "~/models/resources/backgrounds/background-store";
import { type LocalizedBackground } from "~/models/resources/backgrounds/localized-background";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import { createBackgroundEditor } from "./background-editor";
import BackgroundDetail from "./detail/background-detail";
import { BackgroundCard } from "./panel/background-card";
import BackgroundsFilters from "./panel/backgrounds-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Background, LocalizedBackground>([
  {
    key: "abilityScores",
    label: { en: "Ability Scores", it: "Punteggi" },
  },
  {
    key: "feat",
    label: { en: "Feat", it: "Talento" },
  },
  {
    key: "skillProficiencies",
    label: { en: "Skills", it: "Abilità" },
  },
  {
    key: "toolProficiency",
    label: { en: "Tool", it: "Strumento" },
  },
]);

//------------------------------------------------------------------------------
// Backgrounds Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  backgroundStore,
  { initialPaletteName: "sage", path: Route.ResourcesCharacterBackgrounds },
  {
    album: { AlbumCard: BackgroundCard },
    detail: { Detail: BackgroundDetail },
    filters: { Filters: BackgroundsFilters },
    form: {
      Editor: createBackgroundEditor(backgroundForm),
      form: backgroundForm,
      parseFormData: backgroundFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);
