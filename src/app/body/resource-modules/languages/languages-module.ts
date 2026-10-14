import { type Language } from "~/models/resources/languages/language";
import {
  languageForm,
  languageFormDataToResource,
} from "~/models/resources/languages/language-form";
import { languageStore } from "~/models/resources/languages/language-store";
import { type LocalizedLanguage } from "~/models/resources/languages/localized-language";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import LanguageDetail from "./detail/language-detail";
import { createLanguageEditor } from "./language-editor";
import { LanguageCard } from "./panel/language-card";
import LanguagesFilters from "./panel/languages-filters";

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

export const resourceModule = createResourceModule(
  languageStore,
  { initialPaletteName: "sage", path: Route.ResourcesWorldLanguages },
  {
    album: { AlbumCard: LanguageCard },
    detail: { Detail: LanguageDetail },
    filters: { Filters: LanguagesFilters },
    form: {
      Editor: createLanguageEditor(languageForm),
      form: languageForm,
      parseFormData: languageFormDataToResource,
    },
    table: { columns },
  },
);
