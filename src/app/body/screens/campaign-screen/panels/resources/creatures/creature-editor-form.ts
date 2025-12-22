import z from "zod";
import { campaignRoleSchema } from "~/models/types/campaign-role";
import { creatureAbilitySchema } from "~/models/types/creature-ability";
import { creatureAlignmentSchema } from "~/models/types/creature-alignment";
import { creatureConditionSchema } from "~/models/types/creature-condition";
import { creatureHabitatSchema } from "~/models/types/creature-habitat";
import { creatureSizeSchema } from "~/models/types/creature-size";
import { creatureSkillSchema } from "~/models/types/creature-skill";
import { creatureTreasureSchema } from "~/models/types/creature-treasure";
import { creatureTypeSchema } from "~/models/types/creature-type";
import { damageTypeSchema } from "~/models/types/damage-type";
import { createForm } from "~/utils/form";

//------------------------------------------------------------------------------
// Creature Editor Form Fields
//------------------------------------------------------------------------------

export const creatureEditorFormFieldsSchema = z.object({
  ability_cha: z.number(),
  ability_con: z.number(),
  ability_dex: z.number(),
  ability_int: z.number(),
  ability_proficiencies: z.array(creatureAbilitySchema),
  ability_str: z.number(),
  ability_wis: z.number(),
  ac: z.string(),
  actions: z.string(),
  alignment: creatureAlignmentSchema,
  bonus_actions: z.string(),
  condition_immunities: z.array(creatureConditionSchema),
  condition_resistances: z.array(creatureConditionSchema),
  condition_vulnerabilities: z.array(creatureConditionSchema),
  cr: z.number(),
  damage_immunities: z.array(damageTypeSchema),
  damage_resistances: z.array(damageTypeSchema),
  damage_vulnerabilities: z.array(damageTypeSchema),
  gear: z.string(),
  habitats: z.array(creatureHabitatSchema),
  hp: z.string(),
  hp_formula: z.string(),
  initiative: z.string(),
  initiative_passive: z.string(),
  languages: z.string(),
  legendary_actions: z.string(),
  name: z.string(),
  page: z.number(),
  passive_perception: z.string(),
  planes: z.string(),
  reactions: z.string(),
  senses: z.string(),
  size: creatureSizeSchema,
  skill_expertise: z.array(creatureSkillSchema),
  skill_proficiencies: z.array(creatureSkillSchema),
  speed_burrow: z.string(),
  speed_climb: z.string(),
  speed_fly: z.string(),
  speed_swim: z.string(),
  speed_walk: z.string(),
  traits: z.string(),
  treasures: z.array(creatureTreasureSchema),
  type: creatureTypeSchema,
  visibility: campaignRoleSchema,
});

export type CreatureEditorFormFields = z.infer<
  typeof creatureEditorFormFieldsSchema
>;

//------------------------------------------------------------------------------
// Creature Editor Form
//------------------------------------------------------------------------------

const creatureEditorForm = createForm(
  "creature_editor",
  creatureEditorFormFieldsSchema.parse,
);

export const { useField: useCreatureEditorFormField } = creatureEditorForm;

export default creatureEditorForm;

//------------------------------------------------------------------------------
// Ability Scores
//------------------------------------------------------------------------------

export const useCreatureEditorFormAbilityStr = (
  defaultAbilityStr: CreatureEditorFormFields["ability_str"],
) => useCreatureEditorFormField("ability_str", defaultAbilityStr);

export const useCreatureEditorFormAbilityDex = (
  defaultAbilityDex: CreatureEditorFormFields["ability_dex"],
) => useCreatureEditorFormField("ability_dex", defaultAbilityDex);

export const useCreatureEditorFormAbilityCon = (
  defaultAbilityCon: CreatureEditorFormFields["ability_con"],
) => useCreatureEditorFormField("ability_con", defaultAbilityCon);

export const useCreatureEditorFormAbilityInt = (
  defaultAbilityInt: CreatureEditorFormFields["ability_int"],
) => useCreatureEditorFormField("ability_int", defaultAbilityInt);

export const useCreatureEditorFormAbilityWis = (
  defaultAbilityWis: CreatureEditorFormFields["ability_wis"],
) => useCreatureEditorFormField("ability_wis", defaultAbilityWis);

export const useCreatureEditorFormAbilityCha = (
  defaultAbilityCha: CreatureEditorFormFields["ability_cha"],
) => useCreatureEditorFormField("ability_cha", defaultAbilityCha);

//------------------------------------------------------------------------------
// AC
//------------------------------------------------------------------------------

export const useCreatureEditorFormAC = (
  defaultAC: CreatureEditorFormFields["ac"],
) => useCreatureEditorFormField("ac", defaultAC);

//------------------------------------------------------------------------------
// Alignment
//------------------------------------------------------------------------------

export const useCreatureEditorFormAlignment = (
  defaultAlignment: CreatureEditorFormFields["alignment"],
) => useCreatureEditorFormField("alignment", defaultAlignment);

//------------------------------------------------------------------------------
// Condition Interactions
//------------------------------------------------------------------------------

export const useCreatureEditorFormConditionImmunities = (
  defaultConditionImmunities: CreatureEditorFormFields["condition_immunities"],
) =>
  useCreatureEditorFormField(
    "condition_immunities",
    defaultConditionImmunities,
  );

export const useCreatureEditorFormConditionResistances = (
  defaultConditionResistances: CreatureEditorFormFields["condition_resistances"],
) =>
  useCreatureEditorFormField(
    "condition_resistances",
    defaultConditionResistances,
  );

export const useCreatureEditorFormConditionVulnerabilities = (
  defaultConditionVulnerabilities: CreatureEditorFormFields["condition_vulnerabilities"],
) =>
  useCreatureEditorFormField(
    "condition_vulnerabilities",
    defaultConditionVulnerabilities,
  );

//------------------------------------------------------------------------------
// CR
//------------------------------------------------------------------------------

export const useCreatureEditorFormCR = (
  defaultCR: CreatureEditorFormFields["cr"],
) => useCreatureEditorFormField("cr", defaultCR);

//------------------------------------------------------------------------------
// Damage Interactions
//------------------------------------------------------------------------------

export const useCreatureEditorFormDamageImmunities = (
  defaultDamageImmunities: CreatureEditorFormFields["damage_immunities"],
) => useCreatureEditorFormField("damage_immunities", defaultDamageImmunities);

export const useCreatureEditorFormDamageResistances = (
  defaultDamageResistances: CreatureEditorFormFields["damage_resistances"],
) => useCreatureEditorFormField("damage_resistances", defaultDamageResistances);

export const useCreatureEditorFormDamageVulnerabilities = (
  defaultDamageVulnerabilities: CreatureEditorFormFields["damage_vulnerabilities"],
) =>
  useCreatureEditorFormField(
    "damage_vulnerabilities",
    defaultDamageVulnerabilities,
  );

//------------------------------------------------------------------------------
// Gear
//------------------------------------------------------------------------------

export const useCreatureEditorFormGear = (
  defaultGear: CreatureEditorFormFields["gear"],
) => useCreatureEditorFormField("gear", defaultGear);

//------------------------------------------------------------------------------
// Habitats
//------------------------------------------------------------------------------

export const useCreatureEditorFormHabitats = (
  defaultHabitats: CreatureEditorFormFields["habitats"],
) => useCreatureEditorFormField("habitats", defaultHabitats);

//------------------------------------------------------------------------------
// HP
//------------------------------------------------------------------------------

export const useCreatureEditorFormHP = (
  defaultHP: CreatureEditorFormFields["hp"],
) => useCreatureEditorFormField("hp", defaultHP);

//------------------------------------------------------------------------------
// HP Formula
//------------------------------------------------------------------------------

export const useCreatureEditorFormHPFormula = (
  defaultHPFormula: CreatureEditorFormFields["hp_formula"],
) => useCreatureEditorFormField("hp_formula", defaultHPFormula);

//------------------------------------------------------------------------------
// Initiative
//------------------------------------------------------------------------------

export const useCreatureEditorFormInitiative = (
  defaultInitiative: CreatureEditorFormFields["initiative"],
) => useCreatureEditorFormField("initiative", defaultInitiative);

//------------------------------------------------------------------------------
// Initiative Passive
//------------------------------------------------------------------------------

export const useCreatureEditorFormInitiativePassive = (
  defaultInitiativePassive: CreatureEditorFormFields["initiative_passive"],
) => useCreatureEditorFormField("initiative_passive", defaultInitiativePassive);

//------------------------------------------------------------------------------
// Languages
//------------------------------------------------------------------------------

export const useCreatureEditorFormLanguages = (
  defaultLanguages: CreatureEditorFormFields["languages"],
) => useCreatureEditorFormField("languages", defaultLanguages);

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useCreatureEditorFormName = (
  defaultName: CreatureEditorFormFields["name"],
) => useCreatureEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Passive Perception
//------------------------------------------------------------------------------

export const useCreatureEditorFormPassivePerception = (
  defaultPassivePerception: CreatureEditorFormFields["passive_perception"],
) => useCreatureEditorFormField("passive_perception", defaultPassivePerception);

//------------------------------------------------------------------------------
// Planes
//------------------------------------------------------------------------------

export const useCreatureEditorFormPlanes = (
  defaultPlanes: CreatureEditorFormFields["planes"],
) => useCreatureEditorFormField("planes", defaultPlanes);

//------------------------------------------------------------------------------
// Proficiencies
//------------------------------------------------------------------------------

export const useCreatureEditorFormAbilityProficiencies = (
  defaultAbilityProficiencies: CreatureEditorFormFields["ability_proficiencies"],
) =>
  useCreatureEditorFormField(
    "ability_proficiencies",
    defaultAbilityProficiencies,
  );

export const useCreatureEditorFormSkillExpertise = (
  defaultSkillExpertise: CreatureEditorFormFields["skill_expertise"],
) => useCreatureEditorFormField("skill_expertise", defaultSkillExpertise);

export const useCreatureEditorFormSkillProficiencies = (
  defaultSkillProficiencies: CreatureEditorFormFields["skill_proficiencies"],
) =>
  useCreatureEditorFormField("skill_proficiencies", defaultSkillProficiencies);

//------------------------------------------------------------------------------
// Senses
//------------------------------------------------------------------------------

export const useCreatureEditorFormSenses = (
  defaultSenses: CreatureEditorFormFields["senses"],
) => useCreatureEditorFormField("senses", defaultSenses);

//------------------------------------------------------------------------------
// Size
//------------------------------------------------------------------------------

export const useCreatureEditorFormSize = (
  defaultSize: CreatureEditorFormFields["size"],
) => useCreatureEditorFormField("size", defaultSize);

//------------------------------------------------------------------------------
// Speeds
//------------------------------------------------------------------------------

export const useCreatureEditorFormSpeedBurrow = (
  defaultSpeedBurrow: CreatureEditorFormFields["speed_burrow"],
) => useCreatureEditorFormField("speed_burrow", defaultSpeedBurrow);

export const useCreatureEditorFormSpeedClimb = (
  defaultSpeedClimb: CreatureEditorFormFields["speed_climb"],
) => useCreatureEditorFormField("speed_climb", defaultSpeedClimb);

export const useCreatureEditorFormSpeedFly = (
  defaultSpeedFly: CreatureEditorFormFields["speed_fly"],
) => useCreatureEditorFormField("speed_fly", defaultSpeedFly);

export const useCreatureEditorFormSpeedSwim = (
  defaultSpeedSwim: CreatureEditorFormFields["speed_swim"],
) => useCreatureEditorFormField("speed_swim", defaultSpeedSwim);

export const useCreatureEditorFormSpeedWalk = (
  defaultSpeedWalk: CreatureEditorFormFields["speed_walk"],
) => useCreatureEditorFormField("speed_walk", defaultSpeedWalk);

//------------------------------------------------------------------------------
// Traits/Actions
//------------------------------------------------------------------------------

export const useCreatureEditorFormTraits = (
  defaultTraits: CreatureEditorFormFields["traits"],
) => useCreatureEditorFormField("traits", defaultTraits);

export const useCreatureEditorFormActions = (
  defaultActions: CreatureEditorFormFields["actions"],
) => useCreatureEditorFormField("actions", defaultActions);

export const useCreatureEditorFormBonusActions = (
  defaultBonusActions: CreatureEditorFormFields["bonus_actions"],
) => useCreatureEditorFormField("bonus_actions", defaultBonusActions);

export const useCreatureEditorFormReactions = (
  defaultReactions: CreatureEditorFormFields["reactions"],
) => useCreatureEditorFormField("reactions", defaultReactions);

export const useCreatureEditorFormLegendaryActions = (
  defaultLegendaryActions: CreatureEditorFormFields["legendary_actions"],
) => useCreatureEditorFormField("legendary_actions", defaultLegendaryActions);

//------------------------------------------------------------------------------
// Treasures
//------------------------------------------------------------------------------

export const useCreatureEditorFormTreasures = (
  defaultTreasures: CreatureEditorFormFields["treasures"],
) => useCreatureEditorFormField("treasures", defaultTreasures);

//------------------------------------------------------------------------------
// Type
//------------------------------------------------------------------------------

export const useCreatureEditorFormType = (
  defaultType: CreatureEditorFormFields["type"],
) => useCreatureEditorFormField("type", defaultType);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useCreatureEditorFormVisibility = (
  defaultVisibility: CreatureEditorFormFields["visibility"],
) => useCreatureEditorFormField("visibility", defaultVisibility);
