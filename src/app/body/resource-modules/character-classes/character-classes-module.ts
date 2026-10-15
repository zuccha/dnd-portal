import { type CharacterClass } from "~/models/resources/character-classes/character-class";
import {
  characterClassForm,
  characterClassFormDataToResource,
} from "~/models/resources/character-classes/character-class-form";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { type LocalizedCharacterClass } from "~/models/resources/character-classes/localized-character-class";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import { createCharacterClassEditor } from "./character-class-editor";
import CharacterClassDetail from "./detail/character-class-detail";
import { CharacterClassCard } from "./panel/character-class-card";
import CharacterClassesFilters from "./panel/character-classes-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<CharacterClass, LocalizedCharacterClass>([
  {
    key: "primaryAbilities",
    label: { en: "Abilities", it: "Caratteristiche" },
  },
  {
    key: "savingThrowProficiencies",
    label: { en: "Saving Throws", it: "Tiri Salvezza" },
  },
  {
    key: "armorProficiencies",
    label: { en: "Armors", it: "Armature" },
  },
  {
    key: "weaponProficiencies",
    label: { en: "Weapons", it: "Armi" },
  },
  {
    key: "toolProficiencies",
    label: { en: "Tools", it: "Strumenti" },
  },
  {
    key: "hitDie",
    label: { en: "HP Die", it: "Dado Vita" },
    textAlign: "right",
    w: "1%",
  },
]);

//------------------------------------------------------------------------------
// Character Classes Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  characterClassStore,
  { initialPaletteName: "slate", path: Route.ResourcesCharacterClasses },
  {
    album: { AlbumCard: CharacterClassCard },
    detail: { Detail: CharacterClassDetail },
    filters: { Filters: CharacterClassesFilters },
    form: {
      Editor: createCharacterClassEditor(characterClassForm),
      form: characterClassForm,
      parseFormData: characterClassFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);
