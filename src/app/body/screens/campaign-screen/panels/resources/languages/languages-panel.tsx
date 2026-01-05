import {
  type DBLanguage,
  type DBLanguageTranslation,
  dbLanguageSchema,
  dbLanguageTranslationSchema,
} from "~/models/resources/languages/db-language";
import { type Language } from "~/models/resources/languages/language";
import { languageStore } from "~/models/resources/languages/language-store";
import { type LocalizedLanguage } from "~/models/resources/languages/localized-language";
import { report } from "~/utils/error";
import { createResourcesPanel } from "../_base/resources-panel";
import type { ResourcesTableExtra } from "../_base/resources-table";
import LanguageEditor from "./language-editor";
import languageEditorForm, {
  type LanguageEditorFormFields,
} from "./language-editor-form";
import LanguagesAlbumCardContent from "./languages-album-card-content";
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
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(data: Partial<LanguageEditorFormFields>):
  | {
      resource: Partial<DBLanguage>;
      translation: Partial<DBLanguageTranslation>;
    }
  | string {
  const maybeLanguage = {
    rarity: data.rarity,
    visibility: data.visibility,
  };

  const maybeTranslation = {
    name: data.name,
    origin: data.origin,
    page: data.page || null,
  };

  const language = dbLanguageSchema.partial().safeParse(maybeLanguage);
  if (!language.success) return report(language.error, "form.error.invalid");

  const translation = dbLanguageTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { resource: language.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// Languages Panel
//------------------------------------------------------------------------------

const LanguagesPanel = createResourcesPanel(languageStore, {
  album: {
    AlbumCardContent: LanguagesAlbumCardContent,
    getDetails: () => "",
  },
  filters: { Filters: LanguagesFilters },
  form: {
    Editor: LanguageEditor,
    form: languageEditorForm,
    parseFormData,
  },
  table: { columns },
});

export default LanguagesPanel;
