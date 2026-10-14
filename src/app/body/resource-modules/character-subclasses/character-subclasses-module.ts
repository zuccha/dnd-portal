import { type CharacterSubclass } from "~/models/resources/character-subclasses/character-subclass";
import {
  characterSubclassForm,
  characterSubclassFormDataToResource,
} from "~/models/resources/character-subclasses/character-subclass-form";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import { type LocalizedCharacterSubclass } from "~/models/resources/character-subclasses/localized-character-subclass";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import { createCharacterSubclassEditor } from "./character-subclass-editor";
import CharacterSubclassDetail from "./detail/character-subclass-detail";
import { CharacterSubclassCard } from "./panel/character-subclass-card";
import CharacterSubclassesFilters from "./panel/character-subclasses-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<CharacterSubclass, LocalizedCharacterSubclass>([
  {
    key: "character_class",
    label: { en: "Class", it: "Classe" },
  },
]);

//------------------------------------------------------------------------------
// CharacterSubclasses Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  characterSubclassStore,
  { initialPaletteName: "silver", path: Route.ResourcesCharacterSubclasses },
  {
    album: { AlbumCard: CharacterSubclassCard },
    detail: { Detail: CharacterSubclassDetail },
    filters: { Filters: CharacterSubclassesFilters },
    form: {
      Editor: createCharacterSubclassEditor(characterSubclassForm),
      form: characterSubclassForm,
      parseFormData: characterSubclassFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);
