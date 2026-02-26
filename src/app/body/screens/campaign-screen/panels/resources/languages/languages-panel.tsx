import { type Language } from "~/models/resources/languages/language";
import {
  languageForm,
  languageFormDataToDB,
} from "~/models/resources/languages/language-form";
import { languageStore } from "~/models/resources/languages/language-store";
import { type LocalizedLanguage } from "~/models/resources/languages/localized-language";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { LanguageCard } from "./language-card";
import { createLanguageEditor } from "./language-editor";
import LanguagesFilters from "./languages-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Language, LocalizedLanguage>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "rarity",
    label: { en: "Rarity", it: "Rarità" },
    w: "7em",
  },
  {
    key: "origin",
    label: { en: "Origin", it: "Origine" },
  },
] as const;

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
      parseFormData: languageFormDataToDB,
    },
    table: { columns },
  },
);

export default LanguagesPanel;
