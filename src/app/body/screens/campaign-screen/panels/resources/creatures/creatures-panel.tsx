import {
  type Creature,
  defaultCreature,
} from "~/models/resources/creatures/creature";
import { creaturesStore } from "~/models/resources/creatures/creatures-store";
import {
  type DBCreature,
  type DBCreatureTranslation,
  dbCreatureSchema,
  dbCreatureTranslationSchema,
} from "~/models/resources/creatures/db-creature";
import { type LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import { report } from "~/utils/error";
import type { ResourcesListTableColumn } from "../_base/resources-list-table";
import { createResourcesPanel } from "../_base/resources-panel";
import CreatureCard from "./creature-card";
import CreatureEditor from "./creature-editor";
import creatureEditorForm, {
  type CreatureEditorFormFields,
} from "./creature-editor-form";
import CreaturesFilters from "./creatures-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesListTableColumn<Creature, LocalizedCreature>[] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "type",
    label: { en: "Type", it: "Tipo" },
    w: "10em",
  },
  {
    key: "size",
    label: { en: "Size", it: "Taglia" },
    w: "10em",
  },
  {
    key: "alignment",
    label: { en: "Alignment", it: "Allineamento" },
    w: "10em",
  },
  {
    key: "habitats",
    label: { en: "Habitat", it: "Habitat" },
    maxW: "10em",
    w: "10em",
  },
  {
    key: "cr",
    label: { en: "CR", it: "GS" },
    w: "4em",
  },
  {
    key: "hp",
    label: { en: "HP", it: "PF" },
    w: "4em",
  },
  {
    key: "ac",
    label: { en: "AC", it: "CA" },
    w: "4em",
  },
  {
    key: "ability_str",
    label: { en: "Str", it: "For" },
    w: "4em",
  },
  {
    key: "ability_dex",
    label: { en: "Dex", it: "Des" },
    w: "4em",
  },
  {
    key: "ability_con",
    label: { en: "Con", it: "Cos" },
    w: "4em",
  },
  {
    key: "ability_int",
    label: { en: "Int", it: "Int" },
    w: "4em",
  },
  {
    key: "ability_wis",
    label: { en: "Wis", it: "Sag" },
    w: "4em",
  },
  {
    key: "ability_cha",
    label: { en: "Cha", it: "Car" },
    w: "4em",
  },
] as const;

//------------------------------------------------------------------------------
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(data: Partial<CreatureEditorFormFields>):
  | {
      resource: Partial<DBCreature>;
      translation: Partial<DBCreatureTranslation>;
    }
  | string {
  const maybeCreature = {
    visibility: data.visibility,

    alignment: data.alignment,
    habitats: data.habitats,
    size: data.size,
    treasures: data.treasures,
    type: data.type,

    ac: data.ac,
    cr: data.cr,
    hp: data.hp,
    hp_formula: data.hp_formula,

    speed_burrow: data.speed_burrow,
    speed_climb: data.speed_climb,
    speed_fly: data.speed_fly,
    speed_swim: data.speed_swim,
    speed_walk: data.speed_walk,

    ability_cha: data.ability_cha,
    ability_con: data.ability_con,
    ability_dex: data.ability_dex,
    ability_int: data.ability_int,
    ability_str: data.ability_str,
    ability_wis: data.ability_wis,

    initiative: data.initiative,
    initiative_passive: data.initiative_passive,
    passive_perception: data.passive_perception,

    ability_proficiencies: data.ability_proficiencies,
    skill_expertise: data.skill_expertise,
    skill_proficiencies: data.skill_proficiencies,

    damage_immunities: data.damage_immunities,
    damage_resistances: data.damage_resistances,
    damage_vulnerabilities: data.damage_vulnerabilities,

    condition_immunities: data.condition_immunities,
    condition_resistances: data.condition_resistances,
    condition_vulnerabilities: data.condition_vulnerabilities,
  };

  const maybeTranslation = {
    name: data.name,

    gear: data.gear,
    languages: data.languages,
    planes: data.planes,
    senses: data.senses,

    actions: data.actions,
    bonus_actions: data.bonus_actions,
    legendary_actions: data.legendary_actions,
    reactions: data.reactions,
    traits: data.traits,
  };

  const creature = dbCreatureSchema.partial().safeParse(maybeCreature);
  if (!creature.success) return report(creature.error, "form.error.invalid");

  const translation = dbCreatureTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { resource: creature.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// Creatures Panel
//------------------------------------------------------------------------------

const CreaturesPanel = createResourcesPanel({
  Card: CreatureCard,
  EditorContent: CreatureEditor,
  Filters: CreaturesFilters,
  defaultResource: defaultCreature,
  form: creatureEditorForm,
  listTableColumns: columns,
  listTableDescriptionKey: "description",
  name: { en: "creatures", it: "creature" },
  parseFormData,
  store: creaturesStore,
});

export default CreaturesPanel;
