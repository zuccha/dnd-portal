import { type CharacterClass } from "~/models/resources/character-classes/character-class";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import {
  type DBCharacterClass,
  type DBCharacterClassTranslation,
  dbCharacterClassSchema,
  dbCharacterClassTranslationSchema,
} from "~/models/resources/character-classes/db-character-class";
import { type LocalizedCharacterClass } from "~/models/resources/character-classes/localized-character-class";
import { startingEquipmentToEntries } from "~/models/resources/character-classes/starting-equipment";
import { report } from "~/utils/error";
import { createResourcesPanel } from "../_base/resources-panel";
import type { ResourcesTableExtra } from "../_base/resources-table";
import { CharacterClassCard } from "./character-class-card";
import CharacterClassEditor from "./character-class-editor";
import itemEditorForm, {
  type CharacterClassEditorFormFields,
} from "./character-class-editor-form";
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
    key: "hp_die",
    label: { en: "Hit Point Die", it: "Dado Vita" },
  },
] as const;

//------------------------------------------------------------------------------
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(data: Partial<CharacterClassEditorFormFields>):
  | {
      resource: Partial<DBCharacterClass>;
      translation: Partial<DBCharacterClassTranslation>;
    }
  | string {
  const maybeCharacterClass = {
    visibility: data.visibility,

    armor_proficiencies: data.armor_proficiencies,
    hp_die: data.hp_die,
    primary_abilities: data.primary_abilities,
    saving_throw_proficiencies: data.saving_throw_proficiencies,
    skill_proficiencies_pool: data.skill_proficiencies_pool,
    skill_proficiencies_pool_quantity: data.skill_proficiencies_pool_quantity,
    spell_ids: data.spell_ids,
    starting_equipment_entries:
      data.starting_equipment ?
        startingEquipmentToEntries(data.starting_equipment)
      : undefined,
    tool_proficiency_ids: data.tool_proficiency_ids,
    weapon_proficiencies: data.weapon_proficiencies,
  };

  const maybeTranslation = {
    name: data.name,
    page: data.page || null,

    armor_proficiencies_extra: data.armor_proficiencies_extra,
    weapon_proficiencies_extra: data.weapon_proficiencies_extra,
  };

  const characterClass = dbCharacterClassSchema
    .partial()
    .safeParse(maybeCharacterClass);
  if (!characterClass.success)
    return report(characterClass.error, "form.error.invalid");

  const translation = dbCharacterClassTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { resource: characterClass.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// Character Classes Panel
//------------------------------------------------------------------------------

const CharacterClassesPanel = createResourcesPanel(characterClassStore, {
  album: { AlbumCard: CharacterClassCard },
  filters: { Filters: CharacterClassesFilters },
  form: { Editor: CharacterClassEditor, form: itemEditorForm, parseFormData },
  table: { columns },
});

export default CharacterClassesPanel;
