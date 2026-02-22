import { type CharacterSubclass } from "~/models/resources/character-subclasses/character-subclass";
import {
  characterSubclassForm,
  characterSubclassFormDataToDB,
} from "~/models/resources/character-subclasses/character-subclass-form";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import { type LocalizedCharacterSubclass } from "~/models/resources/character-subclasses/localized-character-subclass";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { CharacterSubclassCard } from "./character-subclass-card";
import { createCharacterSubclassEditor } from "./character-subclass-editor";
import CharacterSubclassesFilters from "./character-subclasses-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<
  CharacterSubclass,
  LocalizedCharacterSubclass
>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "character_class",
    label: { en: "Class", it: "Classe" },
    w: "7em",
  },
] as const;

//------------------------------------------------------------------------------
// CharacterSubclasses Panel
//------------------------------------------------------------------------------

const CharacterSubclassesPanel = createResourcesPanel(
  characterSubclassStore,
  { initialPaletteName: "green" },
  {
    album: { AlbumCard: CharacterSubclassCard },
    filters: { Filters: CharacterSubclassesFilters },
    form: {
      Editor: createCharacterSubclassEditor(characterSubclassForm),
      form: characterSubclassForm,
      parseFormData: characterSubclassFormDataToDB,
    },
    table: { columns },
  },
);

export default CharacterSubclassesPanel;
