import { type CharacterSubclass } from "~/models/resources/character-subclasses/character-subclass";
import {
  characterSubclassForm,
  characterSubclassFormDataToResource,
} from "~/models/resources/character-subclasses/character-subclass-form";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import { type LocalizedCharacterSubclass } from "~/models/resources/character-subclasses/localized-character-subclass";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import { CharacterSubclassCard } from "./character-subclass-card";
import { createCharacterSubclassEditor } from "./character-subclass-editor";
import CharacterSubclassesFilters from "./character-subclasses-filters";
import CharacterSubclassDetail from "./detail/character-subclass-detail";

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
    Detail: CharacterSubclassDetail,
    filters: { Filters: CharacterSubclassesFilters },
    form: {
      Editor: createCharacterSubclassEditor(characterSubclassForm),
      form: characterSubclassForm,
      parseFormData: characterSubclassFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);
