import { type Language } from "~/models/resources/languages/language";
import {
  languageForm,
  languageFormDataToResource,
} from "~/models/resources/languages/language-form";
import { languageStore } from "~/models/resources/languages/language-store";
import { type LocalizedLanguage } from "~/models/resources/languages/localized-language";
import { createResourcesPanel } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import { LanguageCard } from "./language-card";
import { createLanguageEditor } from "./language-editor";
import LanguagesFilters from "./languages-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Language, LocalizedLanguage>([
  {
    key: "rarity",
    label: { en: "Rarity", it: "Rarità" },
  },
  {
    key: "origin",
    label: { en: "Origin", it: "Origine" },
  },
]);

//------------------------------------------------------------------------------
// Languages Panel
//------------------------------------------------------------------------------

const LanguagesPanel = createResourcesPanel(
  languageStore,
  { initialPaletteName: "sage" },
  {
    album: { AlbumCard: LanguageCard },
    filters: { Filters: LanguagesFilters },
    form: {
      Editor: createLanguageEditor(languageForm),
      form: languageForm,
      parseFormData: languageFormDataToResource,
    },
    table: { columns },
  },
);

export default LanguagesPanel;
