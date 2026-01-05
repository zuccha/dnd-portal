import { equipmentBundleToEntries } from "~/models/other/equipment-bundle";
import { type Creature } from "~/models/resources/creatures/creature";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import {
  type DBCreature,
  type DBCreatureTranslation,
  dbCreatureSchema,
  dbCreatureTranslationSchema,
} from "~/models/resources/creatures/db-creature";
import { type LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import { report } from "~/utils/error";
import { createResourcesPanel } from "../_base/resources-panel";
import type { ResourcesTableExtra } from "../_base/resources-table";
import CreatureEditor from "./creature-editor";
import creatureEditorForm, {
  type CreatureEditorFormFields,
} from "./creature-editor-form";
import CreaturesAlbumCardContent from "./creatures-album-card-content";
import CreaturesFilters from "./creatures-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Creature, LocalizedCreature>["columns"] = [
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

    ability_cha: data.ability_cha,
    ability_con: data.ability_con,
    ability_dex: data.ability_dex,
    ability_int: data.ability_int,
    ability_proficiencies: data.ability_proficiencies,
    ability_str: data.ability_str,
    ability_wis: data.ability_wis,
    ac: data.ac,
    alignment: data.alignment,
    blindsight: data.blindsight,
    condition_immunities: data.condition_immunities,
    condition_resistances: data.condition_resistances,
    condition_vulnerabilities: data.condition_vulnerabilities,
    cr: data.cr,
    damage_immunities: data.damage_immunities,
    damage_resistances: data.damage_resistances,
    damage_vulnerabilities: data.damage_vulnerabilities,
    darkvision: data.darkvision,
    equipment_entries: data.gear && equipmentBundleToEntries(data.gear),
    habitats: data.habitats,
    hp: data.hp,
    hp_formula: data.hp_formula,
    initiative: data.initiative,
    passive_perception: data.passive_perception,
    size: data.size,
    skill_expertise: data.skill_expertise,
    skill_proficiencies: data.skill_proficiencies,
    speed_burrow: data.speed_burrow,
    speed_climb: data.speed_climb,
    speed_fly: data.speed_fly,
    speed_swim: data.speed_swim,
    speed_walk: data.speed_walk,
    treasures: data.treasures,
    tremorsense: data.tremorsense,
    truesight: data.truesight,
    type: data.type,
  };

  const maybeTranslation = {
    name: data.name,
    page: data.page || null,

    actions: data.actions,
    bonus_actions: data.bonus_actions,
    languages: data.languages,
    legendary_actions: data.legendary_actions,
    planes: data.planes,
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

const CreaturesPanel = createResourcesPanel(creatureStore, {
  album: {
    AlbumCardContent: CreaturesAlbumCardContent,
    getDetails: (localizedCreature) => localizedCreature.description,
  },
  filters: { Filters: CreaturesFilters },
  form: { Editor: CreatureEditor, form: creatureEditorForm, parseFormData },
  table: { columns, detailsKey: "description" },
});

export default CreaturesPanel;
