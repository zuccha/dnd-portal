import { type CharacterClass } from "~/models/resources/character-classes/character-class";
import {
  characterClassForm,
  characterClassFormDataToDB,
} from "~/models/resources/character-classes/character-class-form";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { type LocalizedCharacterClass } from "~/models/resources/character-classes/localized-character-class";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { CharacterClassCard } from "./character-class-card";
import { createCharacterClassEditor } from "./character-class-editor";
import CharacterClassesFilters from "./character-classes-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<
  CharacterClass,
  LocalizedCharacterClass
>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "primary_abilities",
    label: { en: "Abilities", it: "Abilità" },
  },
  {
    key: "saving_throw_proficiencies",
    label: { en: "Saving Throws", it: "Tiri Salvezza" },
  },
  {
    key: "armor_proficiencies",
    label: { en: "Armors", it: "Armature" },
  },
  {
    key: "weapon_proficiencies",
    label: { en: "Weapons", it: "Armi" },
  },
  {
    key: "tool_proficiencies",
    label: { en: "Tools", it: "Strumenti" },
  },
  {
    key: "hp_die",
    label: { en: "HP Die", it: "Dado Vita" },
    textAlign: "right",
    w: "1%",
  },
] as const;

//------------------------------------------------------------------------------
// Character Classes Panel
//------------------------------------------------------------------------------

const CharacterClassesPanel = createResourcesPanel(
  characterClassStore,
  { initialPaletteName: "slate" },
  {
    album: { AlbumCard: CharacterClassCard },
    filters: { Filters: CharacterClassesFilters },
    form: {
      Editor: createCharacterClassEditor(characterClassForm),
      form: characterClassForm,
      parseFormData: characterClassFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default CharacterClassesPanel;
